export default function (engine) {
    engine.closures.add("calculateBaseArmorClass", (fact, context) => {
        const data = fact.data;
        const armor = fact.armor;
        const shields = fact.shields;
        const eac = data.attributes.eac;
        const kac = data.attributes.kac;
        const baseTooltip = game.i18n.format("SFRPG.ACTooltipBase", { base: "10" });
        const notProfTooltip = game.i18n.format("SFRPG.ACTooltipNotProficientMod", { profMod: "-4" });

        eac.tooltip.push(baseTooltip);
        kac.tooltip.push(baseTooltip);

        if (armor || shields) {
            const armorData = armor?.data?.data;

            // Max dex
            const shieldMinDex = shields?.sort((a, b) => a.data.data.dex <= b.data.data.dex ? -1 : 1)[0];
            let maxShieldDex = shieldMinDex?.data.dex ?? Number.MAX_SAFE_INTEGER;
            let maxArmorDex = armorData?.armor.dex ?? Number.MAX_SAFE_INTEGER;

            const maxDex = Math.min(data.abilities.dex.mod, maxArmorDex, maxShieldDex);
            const maxDexTooltip = game.i18n.format("SFRPG.ACTooltipMaxDex", { 
                maxDex: maxDex.signedString(), 
                armorMax: armorData?.armor.dex?.signedString() ?? game.i18n.localize("SFRPG.Items.Unlimited"),
                shieldMax: shieldMinDex?.data.dex?.signedString() ?? game.i18n.localize("SFRPG.Items.Unlimited")
            });

            // AC bonuses
            let armorEac = armorData?.armor?.eac ?? 0;
            let armorKac = armorData?.armor?.kac ?? 0;

            if (armor && !armorData?.proficient) {
                armorEac -= 4;
                armorKac -= 4;

                eac.tooltip.push(notProfTooltip);
                kac.tooltip.push(notProfTooltip);
            }

            let shieldBonus       = 0;
            let totalShieldBonus  = 0;
            
            if (shields) {
                shields.forEach(shield => {
                    const shieldData = shield.data.data;
                    const wieldBonus = shieldData.bonus.wielded || 0;

                    totalShieldBonus += wieldBonus;
                    if (shieldData.proficient) shieldBonus += wieldBonus;
                });

                if (shieldBonus !== totalShieldBonus) {
                    const shieldNotProfTooltip = game.i18n.format("SFRPG.ACTooltipNotProficientShield", { profMod: shieldBonus - totalShieldBonus });
                    eac.tooltip.push(shieldNotProfTooltip);
                    kac.tooltip.push(shieldNotProfTooltip);
                }
            }

            let eacMod = armorEac + shieldBonus + maxDex;
            let kacMod = armorKac + shieldBonus + maxDex;

            // AC
            eac.value = 10 + eacMod;
            kac.value = 10 + kacMod;
            
            if (armor) eac.tooltip.push(game.i18n.format("SFRPG.ACTooltipArmorACMod", { armor: armorEac.signedString(), name: armor.name }));
            if (shields) shields.forEach(shield => eac.tooltip.push(game.i18n.format("SFRPG.ACTooltipShieldACMod", { shield: (shield.data.data.bonus.wielded || 0).signedString(), name: shield.name })));
            eac.tooltip.push(maxDexTooltip);

            if (armor) kac.tooltip.push(game.i18n.format("SFRPG.ACTooltipArmorACMod", { armor: armorKac.signedString(), name: armor.name }));
            if (shields) shields.forEach(shield => kac.tooltip.push(game.i18n.format("SFRPG.ACTooltipShieldACMod", { shield: (shield.data.data.bonus.wielded || 0).signedString(), name: shield.name })));
            kac.tooltip.push(maxDexTooltip);
        } else {
            eac.value = 10 + data.abilities.dex.mod;
            kac.value = 10 + data.abilities.dex.mod;

            eac.tooltip.push(game.i18n.format("SFRPG.ACTooltipMaxDex", { maxDex: data.abilities.dex.mod.signedString() }));
            kac.tooltip.push(game.i18n.format("SFRPG.ACTooltipMaxDex", { maxDex: data.abilities.dex.mod.signedString() }));
        }

        return fact;
    });
}