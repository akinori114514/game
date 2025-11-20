
import { useMemo } from 'react';
import { GameState, Role, Phase, InvestorType, PricingStrategy, MarketTrend, CoFounderType } from '../types';
import { useScenario } from './useScenario';

export const useGameEngine = (
    gameState: GameState, 
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    addNotification: (type: any, msg: string) => void
) => {
    const { checkTriggers } = useScenario();

    const monthlyBurn = useMemo(() => {
        const founderSalary = 300000;
        const employeeSalaries = gameState.employees.reduce((sum, emp) => sum + emp.salary, 0);
        let officeRent = 0;
        if (gameState.phase === Phase.SERIES_A) officeRent = 500000;
        if (gameState.phase === Phase.SERIES_B) officeRent = 3000000;
        const serverCost = 10000 + (gameState.kpi.MRR * 0.05);
        return founderSalary + employeeSalaries + officeRent + serverCost + gameState.marketing_budget;
    }, [gameState]);

    const advanceDate = (currentDate: string): string => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    const calcConversionRate = (pmf: number, techDebt: number, investorType: InvestorType, strategy: PricingStrategy, trend: MarketTrend) => {
         if (investorType === InvestorType.PRODUCT) {
           if (techDebt > 30 || pmf < 40) return 0; 
         }
         let baseRate = 0.05 * (pmf / 100);
         if (strategy === PricingStrategy.PLG) baseRate *= 1.5;
         if (strategy === PricingStrategy.ENTERPRISE) baseRate *= 0.5;
         if (strategy === PricingStrategy.BLITZ) baseRate *= 3.0;
         
         if (trend === MarketTrend.SAAS_BOOM) baseRate *= 1.3;
         if (trend === MarketTrend.RECESSION) baseRate *= 0.7;
         
         const debtPenalty = techDebt > 30 ? 0.8 : 1.0;
         return baseRate * debtPenalty;
    };

    const checkMachineMode = (state: GameState): GameState => {
        if (state.sanity <= 0 && !state.is_machine_mode) {
             return { ...state, is_machine_mode: true, sanity: 0 };
        }
        return state;
    }

    const nextTurn = (turnBonuses: { goldenLeadHit: boolean, incidentsResolved: number }, resetBonuses: () => void) => {
        setGameState(prevState => {
            if (prevState.is_game_over) return prevState;
            let nextState = { ...prevState };
            nextState = checkMachineMode(nextState);
            const productivityMultiplier = nextState.is_machine_mode ? 2.0 : 1.0;
    
            // --- Market Trend Logic ---
            if (nextState.flags.market_trend_weeks_left <= 0) {
                const roll = Math.random();
                let newTrend: MarketTrend = MarketTrend.NORMAL;
                let duration = 8;
                let message = "市場は安定しています。";
    
                if (roll < 0.3) {
                    newTrend = MarketTrend.SAAS_BOOM;
                    duration = 6;
                    message = "市場確変！SaaSバブル到来！";
                } else if (roll < 0.6) {
                    newTrend = MarketTrend.RECESSION;
                    duration = 8;
                    message = "景気後退... 財布の紐が固くなっています。";
                } else if (roll < 0.8) {
                    newTrend = MarketTrend.COMPETITOR_FUD;
                    duration = 4;
                    message = "競合のネガティブキャンペーンが始まりました。";
                }
    
                nextState.market_trend = newTrend;
                nextState.flags.market_trend_weeks_left = duration;
                // Add notification from inside logic requires side-effect, 
                // but we are in setState. We'll rely on useEffect in Context or just handle it loosely here.
            } else {
                nextState.flags.market_trend_weeks_left -= 1;
            }
            
            let techBonus = 1.0;
            let salesBonus = 1.0;
            if (nextState.co_founder?.type === CoFounderType.HACKER) techBonus = 1.5;
            if (nextState.co_founder?.type === CoFounderType.HUSTLER) salesBonus = 1.5;
    
            if (nextState.investor_type === InvestorType.FAMILY && !nextState.is_machine_mode) {
              nextState.sanity = Math.min(100, nextState.sanity + 2);
            }
    
            if (nextState.investor_type === InvestorType.PRODUCT) {
              techBonus *= 1.2;
            }
    
            let frictionPenalty = 1.0;
            if (nextState.hiring_friction_weeks > 0) {
                frictionPenalty = 0.9;
                nextState.hiring_friction_weeks -= 1;
            }
    
            let marketingEfficiency = 1.0;
            if (nextState.investor_type === InvestorType.BLITZ) {
              marketingEfficiency = 1.0 + (nextState.marketing_budget / 5000000);
            }
            
            if (nextState.market_trend === MarketTrend.COMPETITOR_FUD) marketingEfficiency *= 0.7;
            
            const budgetLeads = Math.floor((nextState.marketing_budget / 10000) * marketingEfficiency * productivityMultiplier);
            
            const strategy = nextState.pricing_strategy;
            const phaseMultiplier = nextState.phase === Phase.SEED ? 1 : nextState.phase === Phase.SERIES_A ? 1.6 : 2.4;
            let arpu = 50000 * phaseMultiplier;
            if (strategy === PricingStrategy.PLG) arpu = 12000 * phaseMultiplier;
            if (strategy === PricingStrategy.ENTERPRISE) arpu = 120000 * phaseMultiplier;
            if (strategy === PricingStrategy.BLITZ) arpu = 0;
    
            const currentCustomers = Math.max(1, Math.floor(nextState.kpi.MRR / (arpu || 1)));
            
            let virality = 0;
            if (nextState.pmf_score > 40) {
                virality = (nextState.pmf_score - 40) / 600; 
            }
            if (nextState.investor_type === InvestorType.BLITZ) virality *= 1.2; 
            
            if (strategy === PricingStrategy.PLG) virality *= 1.5;
            if (strategy === PricingStrategy.BLITZ) virality *= 2.0;
            if (nextState.market_trend === MarketTrend.SAAS_BOOM) virality *= 1.5;
    
            const organicLeads = Math.floor(currentCustomers * virality);
            const totalLeads = nextState.leads + budgetLeads + organicLeads;
    
            const salesPeople = nextState.employees.filter(e => e.role === Role.SALES);
            const founderPower = nextState.phase === Phase.SEED ? 5 : nextState.phase === Phase.SERIES_A ? 2 : 0;
            
            const salesCapacity = Math.floor(((salesPeople.length * 10 * salesBonus) + founderPower) * frictionPenalty * productivityMultiplier);
            const actualSalesCapacity = nextState.flags.pmf_frozen ? 0 : salesCapacity;
            
            const processedLeads = Math.min(totalLeads, actualSalesCapacity);
            const leadsLost = Math.max(0, totalLeads - actualSalesCapacity);
    
            let conversionRate = calcConversionRate(nextState.pmf_score, nextState.tech_debt, nextState.investor_type, strategy, nextState.market_trend);
            if (turnBonuses.goldenLeadHit) conversionRate += 0.15;
            
            const newDeals = Math.floor(processedLeads * conversionRate);
            const effectiveArpu = arpu === 0 ? 100 : arpu;
            const newMRR = newDeals * arpu;
    
            const csPeople = nextState.employees.filter(e => e.role === Role.CS);
            const totalCustomersAfterSales = Math.floor((nextState.kpi.MRR + newMRR) / effectiveArpu);
            const csCapacity = Math.floor(csPeople.length * 20 * frictionPenalty * productivityMultiplier);
    
            let churnRate = 0.02;
            churnRate += (nextState.tech_debt / 1000);
            if (nextState.sanity < 20 && !nextState.is_machine_mode) churnRate += 0.01;
            if (totalCustomersAfterSales > 0 && csCapacity < totalCustomersAfterSales) churnRate += 0.05;
            if (nextState.flags.competitor_attacked) churnRate *= 2;
            
            if (strategy === PricingStrategy.PLG) churnRate += 0.01;
            if (strategy === PricingStrategy.BLITZ) churnRate += 0.03;
            
            if (nextState.market_trend === MarketTrend.RECESSION) churnRate += 0.015;
            if (nextState.market_trend === MarketTrend.SAAS_BOOM) churnRate -= 0.005;
    
            if (nextState.investor_type === InvestorType.FAMILY) churnRate *= 0.8;
    
            churnRate = Math.max(0.005, churnRate - (turnBonuses.incidentsResolved * 0.01));
            const churnedMRR = nextState.kpi.MRR * churnRate;
            const finalMRR = Math.max(0, nextState.kpi.MRR + newMRR - churnedMRR);
    
            const weeklyBurn = monthlyBurn / 4;
            let newCash = nextState.cash - weeklyBurn + (finalMRR / 4);
            
            nextState.kpi.MRR = finalMRR;
            nextState.kpi.churn_rate = churnRate;
            nextState.cash = newCash;
            nextState.leads = leadsLost; 
            nextState.week += 1;
            nextState.date = advanceDate(nextState.date);
            
            const netBurn = weeklyBurn * 4 - finalMRR;
            nextState.runway_months = netBurn > 0 ? newCash / netBurn : 99.9;
    
            if (nextState.week % 4 === 0) {
                const prevMRR = nextState.last_month_mrr || 1;
                const growth = (finalMRR - prevMRR) / prevMRR;
                nextState.kpi.growth_rate_mom = growth;
                nextState.last_month_mrr = finalMRR;
    
                if (nextState.investor_type === InvestorType.BLITZ) {
                    if (growth < 0.20) {
                        if (!nextState.is_machine_mode) nextState.sanity -= 10;
                    }
                }
                
                if (nextState.investor_type === InvestorType.FAMILY) {
                    if (netBurn > 0) {
                        nextState.flags.boiled_frog_months += 1;
                    } else {
                        nextState.flags.boiled_frog_months = 0;
                    }
                }
            }
    
            if (!nextState.flags.pmf_frozen && nextState.employees.length > 0) {
                 if (nextState.phase !== Phase.SEED && Math.random() > 0.7) {
                     nextState.tech_debt += 1;
                 }
            }
    
            if (nextState.phase !== Phase.SEED && !nextState.whale_opportunity) {
                if (Math.random() > 0.98) {
                    nextState.whale_opportunity = true;
                }
            }
    
            nextState.flags.pmf_frozen = false; 
    
            nextState.pipeline_metrics = {
                leads_generated: budgetLeads,
                sales_capacity: actualSalesCapacity,
                leads_processed: processedLeads,
                leads_lost: leadsLost,
                new_deals: newDeals,
                cs_capacity: csCapacity,
                required_cs: totalCustomersAfterSales,
                active_incidents: Math.random() > 0.8 ? 1 : 0,
                golden_leads_active: Math.random() > 0.85,
                organic_growth_factor: virality
            };
    
            const triggeredEvent = checkTriggers(nextState);
            if (triggeredEvent) {
                nextState.active_event = triggeredEvent;
                if (triggeredEvent.severity === 'CRITICAL') {
                    nextState.is_decision_mode = true;
                }
            }
    
            if (nextState.runway_months < 1.5 && nextState.cash > 0 && !nextState.is_decision_mode) {
                 nextState.is_decision_mode = true;
            }
            if (nextState.sanity <= 0) {
                 nextState.is_machine_mode = true;
                 nextState.sanity = 0;
            }
    
            if (nextState.sanity < 20 && nextState.sanity > 0 && !nextState.is_decision_mode) {
                 nextState.is_decision_mode = true;
            }
            
            if (!nextState.active_event && nextState.runway_months > 2 && nextState.sanity > 30) {
                nextState.is_decision_mode = false;
            }
    
            if (nextState.cash < 0) {
                nextState.is_game_over = true;
            }
    
            return nextState;
        });
        
        if (gameState.leads > 10 && Math.random() > 0.5) addNotification('SLACK', `リードがたまってきました！ (${gameState.leads})`);
        if (gameState.phase !== Phase.SEED && !gameState.whale_opportunity && Math.random() > 0.98) {
            addNotification('ALERT', 'WHALE DETECTED: Big opportunity incoming!');
        }
        
        resetBonuses();
    };

    return {
        monthlyBurn,
        nextTurn,
        checkMachineMode,
        withMachineModeCheck: checkMachineMode
    };
};
