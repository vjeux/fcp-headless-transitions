__ZN11PCEvaluator19findLengthOfEllipseEdddd:
000000000000d2b4	movapd	%xmm1, %xmm2
000000000000d2b8	movapd	%xmm0, %xmm1
000000000000d2bc	movapd	0x1153ac(%rip), %xmm0
000000000000d2c4	movapd	%xmm1, %xmm4
000000000000d2c8	andpd	%xmm0, %xmm4
000000000000d2cc	movsd	0x1155ac(%rip), %xmm3
000000000000d2d4	ucomisd	%xmm4, %xmm3
000000000000d2d8	andpd	%xmm2, %xmm0
000000000000d2dc	jbe	0xd2f4
000000000000d2de	mulsd	0x115252(%rip), %xmm2
000000000000d2e6	cmpltsd	0x115591(%rip), %xmm0
000000000000d2ef	andnpd	%xmm2, %xmm0
000000000000d2f3	retq
000000000000d2f4	ucomisd	%xmm0, %xmm3
000000000000d2f8	jbe	0xd307
000000000000d2fa	mulsd	0x115236(%rip), %xmm1
000000000000d302	movapd	%xmm1, %xmm0
000000000000d306	retq
000000000000d307	pushq	%rbp
000000000000d308	movq	%rsp, %rbp
000000000000d30b	movsd	0x11525d(%rip), %xmm0
000000000000d313	callq	__ZN10PCCalculus19ellipseLineIntegralEddd ## PCCalculus::ellipseLineIntegral(double, double, double)
000000000000d318	mulsd	0x115218(%rip), %xmm0
000000000000d320	popq	%rbp
000000000000d321	retq
