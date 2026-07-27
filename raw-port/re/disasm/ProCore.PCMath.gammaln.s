__ZN6PCMath7gammalnEd:
00000000000126bc	pushq	%rbp
00000000000126bd	movq	%rsp, %rbp
00000000000126c0	subq	$0x20, %rsp
00000000000126c4	movapd	%xmm0, %xmm1
00000000000126c8	movapd	%xmm0, -0x20(%rbp)
00000000000126cd	movsd	0x11037b(%rip), %xmm0
00000000000126d5	addsd	%xmm1, %xmm0
00000000000126d9	movsd	%xmm0, -0x8(%rbp)
00000000000126de	movsd	0x1101aa(%rip), %xmm2
00000000000126e6	addsd	%xmm1, %xmm2
00000000000126ea	movsd	%xmm2, -0x10(%rbp)
00000000000126ef	callq	0xde918                         ## symbol stub for: _log
00000000000126f4	mulsd	-0x10(%rbp), %xmm0
00000000000126f9	movsd	-0x8(%rbp), %xmm1
00000000000126fe	subsd	%xmm0, %xmm1
0000000000012702	movsd	%xmm1, -0x8(%rbp)
0000000000012707	movapd	-0x20(%rbp), %xmm4
000000000001270c	movddup	%xmm4, %xmm1                    ## xmm1 = xmm4[0,0]
0000000000012710	movapd	0x110398(%rip), %xmm0
0000000000012718	addpd	%xmm1, %xmm0
000000000001271c	movapd	0x11039c(%rip), %xmm2
0000000000012724	divpd	%xmm0, %xmm2
0000000000012728	movsd	0x110328(%rip), %xmm0
0000000000012730	addsd	%xmm2, %xmm0
0000000000012734	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
0000000000012738	subsd	%xmm2, %xmm0
000000000001273c	movapd	0x11038c(%rip), %xmm2
0000000000012744	addpd	%xmm1, %xmm2
0000000000012748	movapd	0x110390(%rip), %xmm3
0000000000012750	divpd	%xmm2, %xmm3
0000000000012754	addsd	%xmm3, %xmm0
0000000000012758	unpckhpd	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
000000000001275c	subsd	%xmm3, %xmm0
0000000000012760	addpd	0x110388(%rip), %xmm1
0000000000012768	movapd	0x110390(%rip), %xmm2
0000000000012770	divpd	%xmm1, %xmm2
0000000000012774	addsd	%xmm2, %xmm0
0000000000012778	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
000000000001277c	subsd	%xmm2, %xmm0
0000000000012780	mulsd	0x1102d8(%rip), %xmm0
0000000000012788	divsd	%xmm4, %xmm0
000000000001278c	callq	0xde918                         ## symbol stub for: _log
0000000000012791	subsd	-0x8(%rbp), %xmm0
0000000000012796	addq	$0x20, %rsp
000000000001279a	popq	%rbp
000000000001279b	retq
