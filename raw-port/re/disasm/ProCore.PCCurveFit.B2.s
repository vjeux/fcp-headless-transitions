__ZN10PCCurveFit2B2Ed:
000000000000c4b2	pushq	%rbp
000000000000c4b3	movq	%rsp, %rbp
000000000000c4b6	movsd	0x116072(%rip), %xmm1
000000000000c4be	subsd	%xmm0, %xmm1
000000000000c4c2	movsd	0x11615e(%rip), %xmm2
000000000000c4ca	mulsd	%xmm0, %xmm2
000000000000c4ce	mulsd	%xmm2, %xmm0
000000000000c4d2	mulsd	%xmm1, %xmm0
000000000000c4d6	popq	%rbp
000000000000c4d7	retq
