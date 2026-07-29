__ZN21OZBSplineInterpolator26convertBSplineBiasToLinearEd:
0000000000041cfa	pushq	%rbp
0000000000041cfb	movq	%rsp, %rbp
0000000000041cfe	movapd	%xmm0, %xmm1
0000000000041d02	movsd	0x6d81e(%rip), %xmm0
0000000000041d0a	ucomisd	%xmm1, %xmm0
0000000000041d0e	jbe	0x41d26
0000000000041d10	movsd	0x6eae0(%rip), %xmm0
0000000000041d18	subsd	%xmm1, %xmm0
0000000000041d1c	divsd	0x6eadc(%rip), %xmm0
0000000000041d24	jmp	0x41d48
0000000000041d26	xorpd	%xmm0, %xmm0
0000000000041d2a	ucomisd	0x6d7f6(%rip), %xmm1
0000000000041d32	jb	0x41d48
0000000000041d34	movsd	0x6eaac(%rip), %xmm0
0000000000041d3c	subsd	%xmm1, %xmm0
0000000000041d40	divsd	0x6eaa8(%rip), %xmm0
0000000000041d48	popq	%rbp
0000000000041d49	retq
