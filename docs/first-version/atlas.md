> **Record of its time.** Written 2026-11-22 12:16 (local time, UTC+10) for v0.1.0, copied here on 2026-11-26 with its paths made neutral and nothing else changed. Paths that start with `<scratch>/`, and the build folders it names without that prefix (such as `e1/`, `final/` or `tune-banks/`), were in the build's scratch folder, which is not in this repository; nor are the scripts and outputs it cites. The checks kept from that work are in [`checks/`](../../checks/). The game has changed since; the code is the authority on what it does now.

# Prisoner's Dilemma Scenario Atlas

Fields: domain | setup | players | C (cooperate); D (defect) | variant | TWIST a mechanic could express. Non-strict relatives are tagged in the variant field.

1. History | WWI trench live-and-let-live | opposing battalions | C shoot wide; D raid | iterated, noisy | TWIST: your own HQ punishes visible cooperation, so peace must be disguised; troop rotation wipes trust.
2. History | Maghribi merchants, 11th century | traders and overseas agents | C deal honestly; D embezzle | iterated, multilateral | TWIST: news travels by slow letter; one cheat triggers boycott by all.
3. Geopolitics | Nuclear arms control | superpowers | C cap warheads; D build secretly | iterated, imperfect monitoring | TWIST: you see estimates, never moves; inspections must be bargained for.
4. War | False-alarm launch warning (1983) | nuclear command posts | C wait; D retaliate | one-shot, noisy | TWIST: the defection you observe may be sensor error; response is irreversible.
5. Geopolitics | Tariff war | trading nations | C open markets; D tariffs | iterated, asymmetric | TWIST: a domestic lobby pays leaders to defect; the larger economy loses less.
6. Geopolitics | Shared river | upstream and downstream states | C release water; D dam | sequential, asymmetric | TWIST: downstream cannot retaliate in kind, so must link an unrelated issue.
7. Climate | Emissions cuts | nations | C decarbonise; D emit | n-player, asymmetric | TWIST: the main victims are future players who get no move.
8. Business | Duopoly pricing | two airlines | C hold fares; D undercut | iterated | TWIST: talking is illegal; you can signal only through public prices.
9. Business | Advertising arms race | cigarette makers | C stay quiet; D advertise | iterated | TWIST: an imposed ban raises both profits, so players may want their own handcuffs.
10. Law | Cartel leniency programme | price-fixing firms | C stay silent; D confess | n-player race | TWIST: only the FIRST defector gets immunity; the designer wants cooperation to fail.
11. Finance | Bank run | depositors | C stay; D withdraw | n-player, sequential (stag-hunt relative) | TWIST: queue position decides payout; rumours become self-fulfilling past a threshold.
12. Finance | Cartel oil quotas | producer states | C keep quota; D overpump | n-player, asymmetric | TWIST: cheating shows only in the aggregate price; one swing producer can punish at self-cost.
13. Finance | Short squeeze | retail holders | C hold; D sell | n-player with exit (timing game) | TWIST: the pot grows while all hold; the question is when, not whether, to defect.
14. Finance | Fire-sale liquidity spiral | leveraged funds | C hold assets; D dump | n-player, networked | TWIST: each sale marks down everyone's collateral, forcing further defections.
15. Finance | Front-running speed race | trading firms | C normal speed; D buy microseconds | iterated arms race | TWIST: advantage is purely relative, and the exchange sells weapons to both sides.
16. Ecology | Fishery commons | fleets | C obey quota; D overfish | n-player, iterated | TWIST: the stock is hidden state with delayed, nonlinear collapse and slow recovery.
17. Biology | Cleaner wrasse | cleaner and client fish | C eat parasites; D bite mucus | asymmetric, iterated | TWIST: queuing clients watch, and cheated clients simply leave.
18. Biology | Vampire bats | roost-mates | C share blood; D refuse | iterated, alternating roles | TWIST: roles flip by luck; a cheap gift today is life insurance tomorrow.
19. Biology | Siderophore bacteria | microbial strains | C secrete iron-scavengers; D freeload | n-player, spatial | TWIST: strategies are inherited, not chosen; you shape geography and selection, not decisions.
20. Health | Antibiotic resistance | doctors and farms | C prescribe sparingly; D overuse | n-player | TWIST: each defection is invisible, harmless alone, and permanently cumulative.
21. Health | Vaccination | parents | C vaccinate; D free-ride | n-player threshold (snowdrift relative) | TWIST: the more others cooperate, the more tempting defection becomes.
22. Health | Outbreak reporting | governments | C disclose early; D conceal | iterated, private information | TWIST: honesty is punished instantly with travel bans; cooperating means surrendering a secret.
23. AI | Frontier-lab safety race | AI developers | C test longer; D ship first | n-player, uncertain | TWIST: nobody knows the true payoff matrix, and the downside is shared by all.
24. Tech | Zero-day exploits | intelligence agencies | C disclose the bug; D stockpile | iterated | TWIST: hoarded defections can leak and arm outsiders against everyone.
25. Tech | Open-source dependency | corporations | C fund maintainers; D free-ride | n-player, weakest-link | TWIST: neglect stays invisible until one exhausted volunteer breaks everything.
26. Crime | Interrogation | co-suspects | C silence; D inform | one-shot | TWIST: the interrogator designs the matrix and may lie about the other's move.
27. Crime | Ransom handover | kidnapper and family | C deliver; D renege | sequential, one-shot | TWIST: someone must move first; trust comes from slicing the exchange into instalments.
28. Sport | Doping | athletes | C stay clean; D dope | n-player | TWIST: detection is probabilistic and retroactive; samples retested years later rewrite old results.
29. Sport | Cycling breakaway | escapee riders | C take pulls; D wheel-suck | iterated, known end (snowdrift relative) | TWIST: allies must turn rivals before the line; shirk too early and the peloton swallows everyone.
30. Academia | Data hoarding | rival labs | C share data; D sit on it | iterated | TWIST: credit is winner-take-all, so sharing arms the rival who scoops you.
31. Academia | Grade inflation | universities | C grade honestly; D inflate | n-player | TWIST: defection debases a shared currency until the signal dies for everyone.
32. Everyday | Split restaurant bill | diners | C order modestly; D order lobster | n-player, one-shot | TWIST: cost is diluted by headcount, so temptation scales with group size.
33. Everyday | Emergency bystanders | witnesses | C call for help; D assume someone will | n-player (volunteer's dilemma) | TWIST: one cooperator suffices, so bigger crowds help less.
34. Online | Marketplace strangers | buyer and seller | C pay and ship; D scam | sequential | TWIST: public reputation turns one-shots into a repeated game, until identities are faked or reset.
35. Online | Clickbait race | publishers | C honest headlines; D outrage bait | n-player | TWIST: a platform algorithm sets the payoffs and silently changes them.
36. Sci-fi | First contact in a silent galaxy | civilisations | C announce; D strike or hide | one-shot, light-speed lag | TWIST: no verification, decades of delay, and technology may leap meanwhile.
37. Sci-fi | Mirror match | an AI and its exact copy | C or D | one-shot | TWIST: the opponent runs your reasoning, or both read each other's source code first.

## Recurring twist dimensions

1. **Information**: payoff matrix, opponent type and history known, hidden, or falsified.
2. **Observability**: moves seen exactly, noisily, only in aggregate, years later, or never.
3. **Timing**: simultaneous or sequential, delayed feedback, known or unknown end, when-to-defect races.
4. **Player count and structure**: pairs, crowds, thresholds, weakest-link, volunteer, networks, spatial neighbourhoods.
5. **Asymmetry**: unequal power, position, stakes, or roles that flip by chance.
6. **Reversibility and accumulation**: irreversible moves, hidden cumulative state, tipping points, slow recovery.
7. **Communication**: none, cheap talk, forbidden talk, signalling through actions, outright lies.
8. **Exit and partner choice**: walk away, switch partner, reset identity.
9. **Third parties**: designers, enforcers, audiences, arms dealers, profiteers, voiceless victims.
10. **Commitment and framing**: bonds, instalments, self-imposed handcuffs, inherited strategies, and cases where cooperation is the socially bad outcome.
