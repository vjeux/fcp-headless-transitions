__ZN11PCEvaluator18findPointOnEllipseEdddddPdS0_S0_:
000000000000d322	pushq	%rbp
000000000000d323	movq	%rsp, %rbp
000000000000d326	pushq	%r15
000000000000d328	pushq	%r14
000000000000d32a	pushq	%rbx
000000000000d32b	subq	$0x78, %rsp
000000000000d32f	movq	%rcx, %rbx
000000000000d332	movq	%rdx, %r14
000000000000d335	movq	%rsi, %r15
000000000000d338	movapd	%xmm1, %xmm5
000000000000d33c	subsd	%xmm2, %xmm1
000000000000d340	andpd	0x115328(%rip), %xmm1
000000000000d348	movapd	%xmm0, %xmm4
000000000000d34c	movsd	0x11552c(%rip), %xmm0
000000000000d354	ucomisd	%xmm1, %xmm0
000000000000d358	movsd	%xmm2, -0x20(%rbp)
000000000000d35d	movapd	%xmm5, -0x50(%rbp)
000000000000d362	jbe	0xd375
000000000000d364	mulsd	0x115234(%rip), %xmm4
000000000000d36c	addsd	%xmm4, %xmm4
000000000000d370	jmp	0xd675
000000000000d375	movsd	0x11550b(%rip), %xmm3
000000000000d37d	movapd	%xmm3, %xmm1
000000000000d381	maxsd	%xmm5, %xmm1
000000000000d385	maxsd	%xmm2, %xmm3
000000000000d389	movsd	0x1151df(%rip), %xmm0
000000000000d391	movsd	%xmm0, -0x70(%rbp)
000000000000d396	movsd	%xmm1, -0x28(%rbp)
000000000000d39b	movsd	%xmm3, -0x30(%rbp)
000000000000d3a0	movapd	%xmm3, %xmm2
000000000000d3a4	movapd	%xmm4, -0x40(%rbp)
000000000000d3a9	callq	__ZN10PCCalculus19ellipseLineIntegralEddd ## PCCalculus::ellipseLineIntegral(double, double, double)
000000000000d3ae	movapd	%xmm0, %xmm5
000000000000d3b2	mulsd	0x11517e(%rip), %xmm5
000000000000d3ba	movapd	-0x40(%rbp), %xmm2
000000000000d3bf	xorps	%xmm0, %xmm0
000000000000d3c2	roundsd	$0x9, %xmm2, %xmm0
000000000000d3c8	movapd	%xmm2, %xmm4
000000000000d3cc	subsd	%xmm0, %xmm4
000000000000d3d0	movsd	0x115158(%rip), %xmm1
000000000000d3d8	movapd	%xmm1, %xmm0
000000000000d3dc	cmpnlesd	%xmm2, %xmm0
000000000000d3e1	blendvpd	%xmm0, %xmm2, %xmm4
000000000000d3e6	movapd	%xmm4, %xmm2
000000000000d3ea	addsd	%xmm1, %xmm2
000000000000d3ee	xorpd	%xmm3, %xmm3
000000000000d3f2	movapd	%xmm4, %xmm0
000000000000d3f6	cmpltsd	%xmm3, %xmm0
000000000000d3fb	blendvpd	%xmm0, %xmm2, %xmm4
000000000000d400	movsd	0x1151d8(%rip), %xmm3
000000000000d408	ucomisd	%xmm4, %xmm3
000000000000d40c	jbe	0xd428
000000000000d40e	movapd	-0x50(%rbp), %xmm0
000000000000d413	ucomisd	-0x20(%rbp), %xmm0
000000000000d418	movapd	%xmm4, %xmm1
000000000000d41c	jbe	0xd492
000000000000d41e	movapd	%xmm3, %xmm1
000000000000d422	subsd	%xmm4, %xmm1
000000000000d426	jmp	0xd492
000000000000d428	movsd	0x115460(%rip), %xmm0
000000000000d430	ucomisd	%xmm4, %xmm0
000000000000d434	jbe	0xd450
000000000000d436	movapd	-0x50(%rbp), %xmm1
000000000000d43b	ucomisd	-0x20(%rbp), %xmm1
000000000000d440	subsd	%xmm4, %xmm0
000000000000d444	jbe	0xd48e
000000000000d446	movapd	%xmm3, %xmm1
000000000000d44a	subsd	%xmm0, %xmm1
000000000000d44e	jmp	0xd492
000000000000d450	movsd	0x115440(%rip), %xmm0
000000000000d458	ucomisd	%xmm4, %xmm0
000000000000d45c	movsd	-0x20(%rbp), %xmm0
000000000000d461	movapd	-0x50(%rbp), %xmm2
000000000000d466	jbe	0xd47c
000000000000d468	ucomisd	%xmm0, %xmm2
000000000000d46c	movsd	0x115134(%rip), %xmm1
000000000000d474	addsd	%xmm4, %xmm1
000000000000d478	ja	0xd486
000000000000d47a	jmp	0xd492
000000000000d47c	ucomisd	%xmm0, %xmm2
000000000000d480	subsd	%xmm4, %xmm1
000000000000d484	jbe	0xd492
000000000000d486	movapd	%xmm3, %xmm0
000000000000d48a	subsd	%xmm1, %xmm0
000000000000d48e	movapd	%xmm0, %xmm1
000000000000d492	movapd	%xmm4, -0x90(%rbp)
000000000000d49a	mulsd	%xmm1, %xmm5
000000000000d49e	movsd	%xmm5, -0x58(%rbp)
000000000000d4a3	xorpd	%xmm0, %xmm0
000000000000d4a7	movsd	-0x28(%rbp), %xmm1
000000000000d4ac	movsd	-0x30(%rbp), %xmm2
000000000000d4b1	callq	__ZN10PCCalculus19ellipseLineIntegralEddd ## PCCalculus::ellipseLineIntegral(double, double, double)
000000000000d4b6	movsd	%xmm0, -0x60(%rbp)
000000000000d4bb	movsd	0x1150ad(%rip), %xmm0
000000000000d4c3	movsd	-0x28(%rbp), %xmm1
000000000000d4c8	movsd	-0x30(%rbp), %xmm2
000000000000d4cd	callq	__ZN10PCCalculus19ellipseLineIntegralEddd ## PCCalculus::ellipseLineIntegral(double, double, double)
000000000000d4d2	movapd	%xmm0, %xmm1
000000000000d4d6	movsd	-0x58(%rbp), %xmm0
000000000000d4db	movsd	-0x60(%rbp), %xmm2
000000000000d4e0	subsd	%xmm2, %xmm0
000000000000d4e4	mulsd	0x115084(%rip), %xmm0
000000000000d4ec	movapd	%xmm1, -0x80(%rbp)
000000000000d4f1	subsd	%xmm2, %xmm1
000000000000d4f5	divsd	%xmm1, %xmm0
000000000000d4f9	xorpd	%xmm1, %xmm1
000000000000d4fd	movsd	%xmm1, -0x68(%rbp)
000000000000d502	addsd	%xmm1, %xmm0
000000000000d506	movapd	%xmm0, -0x40(%rbp)
000000000000d50b	movsd	-0x28(%rbp), %xmm1
000000000000d510	movsd	-0x30(%rbp), %xmm2
000000000000d515	callq	__ZN10PCCalculus19ellipseLineIntegralEddd ## PCCalculus::ellipseLineIntegral(double, double, double)
000000000000d51a	movsd	-0x58(%rbp), %xmm3
000000000000d51f	movapd	%xmm0, %xmm1
000000000000d523	subsd	%xmm3, %xmm0
000000000000d527	andpd	0x115141(%rip), %xmm0
000000000000d52f	movsd	0x115369(%rip), %xmm2
000000000000d537	ucomisd	%xmm0, %xmm2
000000000000d53b	jbe	0xd547
000000000000d53d	movsd	-0x20(%rbp), %xmm2
000000000000d542	jmp	0xd5fb
000000000000d547	movapd	-0x80(%rbp), %xmm4
000000000000d54c	ucomisd	%xmm1, %xmm3
000000000000d550	movapd	%xmm1, %xmm0
000000000000d554	cmpltsd	%xmm3, %xmm0
000000000000d559	movapd	%xmm1, %xmm5
000000000000d55d	blendvpd	%xmm0, %xmm4, %xmm5
000000000000d562	movapd	-0x40(%rbp), %xmm0
000000000000d567	ja	0xd575
000000000000d569	movsd	-0x68(%rbp), %xmm1
000000000000d56e	movsd	-0x60(%rbp), %xmm2
000000000000d573	jmp	0xd582
000000000000d575	movapd	%xmm1, %xmm2
000000000000d579	movapd	%xmm0, %xmm1
000000000000d57d	movsd	-0x70(%rbp), %xmm0
000000000000d582	movsd	%xmm0, -0x70(%rbp)
000000000000d587	subsd	%xmm1, %xmm0
000000000000d58b	subsd	%xmm2, %xmm3
000000000000d58f	mulsd	%xmm0, %xmm3
000000000000d593	movapd	%xmm5, %xmm0
000000000000d597	movsd	%xmm2, -0x60(%rbp)
000000000000d59c	subsd	%xmm2, %xmm0
000000000000d5a0	divsd	%xmm0, %xmm3
000000000000d5a4	movsd	%xmm1, -0x68(%rbp)
000000000000d5a9	addsd	%xmm1, %xmm3
000000000000d5ad	movapd	%xmm3, -0x40(%rbp)
000000000000d5b2	movapd	%xmm3, %xmm0
000000000000d5b6	movsd	-0x28(%rbp), %xmm1
000000000000d5bb	movsd	-0x30(%rbp), %xmm2
000000000000d5c0	movapd	%xmm5, -0x80(%rbp)
000000000000d5c5	callq	__ZN10PCCalculus19ellipseLineIntegralEddd ## PCCalculus::ellipseLineIntegral(double, double, double)
000000000000d5ca	movsd	-0x58(%rbp), %xmm3
000000000000d5cf	movapd	%xmm0, %xmm1
000000000000d5d3	subsd	%xmm3, %xmm0
000000000000d5d7	andpd	0x115091(%rip), %xmm0
000000000000d5df	movsd	0x1152b9(%rip), %xmm2
000000000000d5e7	ucomisd	%xmm0, %xmm2
000000000000d5eb	movapd	-0x80(%rbp), %xmm4
000000000000d5f0	movsd	-0x20(%rbp), %xmm2
000000000000d5f5	jbe	0xd54c
000000000000d5fb	movapd	-0x90(%rbp), %xmm3
000000000000d603	movsd	0x114fd5(%rip), %xmm0
000000000000d60b	ucomisd	%xmm3, %xmm0
000000000000d60f	movsd	0x114f59(%rip), %xmm1
000000000000d617	movapd	-0x40(%rbp), %xmm4
000000000000d61c	subsd	%xmm4, %xmm1
000000000000d620	movapd	%xmm2, %xmm0
000000000000d624	cmpltsd	-0x50(%rbp), %xmm0
000000000000d62a	blendvpd	%xmm0, %xmm1, %xmm4
000000000000d62f	ja	0xd675
000000000000d631	movsd	0x115257(%rip), %xmm0
000000000000d639	ucomisd	%xmm3, %xmm0
000000000000d63d	jbe	0xd649
000000000000d63f	movsd	0x114f59(%rip), %xmm0
000000000000d647	jmp	0xd66d
000000000000d649	movsd	0x115247(%rip), %xmm0
000000000000d651	ucomisd	%xmm3, %xmm0
000000000000d655	jbe	0xd665
000000000000d657	movsd	0x114f41(%rip), %xmm0
000000000000d65f	addsd	%xmm0, %xmm4
000000000000d663	jmp	0xd675
000000000000d665	movsd	0x114ef3(%rip), %xmm0
000000000000d66d	subsd	%xmm4, %xmm0
000000000000d671	movapd	%xmm0, %xmm4
000000000000d675	testq	%r15, %r15
000000000000d678	movapd	%xmm4, -0x40(%rbp)
000000000000d67d	je	0xd6a6
000000000000d67f	movaps	-0x50(%rbp), %xmm0
000000000000d683	xorps	0xd49e6(%rip), %xmm0
000000000000d68a	movaps	%xmm0, -0x50(%rbp)
000000000000d68e	movapd	%xmm4, %xmm0
000000000000d692	callq	0xde7ce                         ## symbol stub for: _cos
000000000000d697	movapd	-0x40(%rbp), %xmm4
000000000000d69c	mulsd	-0x50(%rbp), %xmm0
000000000000d6a1	movsd	%xmm0, (%r15)
000000000000d6a6	testq	%r14, %r14
000000000000d6a9	je	0xd6c7
000000000000d6ab	movapd	%xmm4, %xmm0
000000000000d6af	callq	0xdeb2e                         ## symbol stub for: _sin
000000000000d6b4	movapd	-0x40(%rbp), %xmm4
000000000000d6b9	movsd	-0x20(%rbp), %xmm1
000000000000d6be	mulsd	%xmm0, %xmm1
000000000000d6c2	movsd	%xmm1, (%r14)
000000000000d6c7	testq	%rbx, %rbx
000000000000d6ca	je	0xd6d0
000000000000d6cc	movsd	%xmm4, (%rbx)
000000000000d6d0	addq	$0x78, %rsp
000000000000d6d4	popq	%rbx
000000000000d6d5	popq	%r14
000000000000d6d7	popq	%r15
000000000000d6d9	popq	%rbp
000000000000d6da	retq
000000000000d6db	nop
