export function review(c: { interval: number; ease: number; repetitions: number; lapses: number }, q: number) {
    q = Math.max(0, Math.min(5, Math.round(q)));
    let e = Math.max(1.3, c.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    let i = c.interval;
    let r = c.repetitions;
    let l = c.lapses;
    
    if (q < 3) {
        r = 0;
        l++;
        i = 1;
    } else {
        r++;
        if (r === 1) {
            i = 1;
        } else if (r === 2) {
            i = 6;
        } else {
            i = Math.max(1, i * e);
        }
    }
    
    return {
        interval: i,
        ease: +e.toFixed(3),
        repetitions: r,
        lapses: l,
        dueAt: new Date(Date.now() + i * 86400000).toISOString()
    };
}
