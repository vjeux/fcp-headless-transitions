__ZN18OZAlignSimBehavior18accumInitialValuesEP15OZSimStateArrayi:
00000000003f2320	pushq	%rbp
00000000003f2321	movq	%rsp, %rbp
00000000003f2324	pushq	%r15
00000000003f2326	pushq	%r14
00000000003f2328	pushq	%rbx
00000000003f2329	subq	$0x128, %rsp                    ## imm = 0x128
00000000003f2330	movl	%edx, %ebx
00000000003f2332	movq	%rsi, %r14
00000000003f2335	movq	%rdi, %r15
00000000003f2338	movq	0x28(%rsi), %rax
00000000003f233c	movq	%rax, -0x70(%rbp)
00000000003f2340	movups	0x18(%rsi), %xmm0
00000000003f2344	movaps	%xmm0, -0x80(%rbp)
00000000003f2348	movq	(%rdi), %rax
00000000003f234b	movq	0x28(%rsi), %rcx
00000000003f234f	movq	%rcx, 0x10(%rsp)
00000000003f2354	movdqu	0x18(%rsi), %xmm0
00000000003f2359	movdqu	%xmm0, (%rsp)
00000000003f235e	xorl	%esi, %esi
00000000003f2360	movl	$0x1, %edx
00000000003f2365	movl	$0x1, %ecx
00000000003f236a	callq	*0x128(%rax)
00000000003f2370	testb	%al, %al
00000000003f2372	je	0x3f2957
00000000003f2378	movq	-0x70(%rbp), %rax
00000000003f237c	movq	%rax, -0xb0(%rbp)
00000000003f2383	movaps	-0x80(%rbp), %xmm0
00000000003f2387	movaps	%xmm0, -0xc0(%rbp)
00000000003f238e	leaq	0x1f0(%r15), %rdi
00000000003f2395	leaq	-0xc0(%rbp), %rsi
00000000003f239c	xorps	%xmm0, %xmm0
00000000003f239f	movsd	%xmm0, -0x50(%rbp)
00000000003f23a4	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f23a9	xorps	%xmm0, %xmm0
00000000003f23ac	movaps	%xmm0, -0xf0(%rbp)
00000000003f23b3	xorps	%xmm0, %xmm0
00000000003f23b6	movsd	%xmm0, -0x58(%rbp)
00000000003f23bb	movaps	%xmm0, -0xa0(%rbp)
00000000003f23c2	movaps	%xmm0, -0x90(%rbp)
00000000003f23c9	movsd	%xmm0, -0x60(%rbp)
00000000003f23ce	xorps	%xmm0, %xmm0
00000000003f23d1	movaps	%xmm0, -0x100(%rbp)
00000000003f23d8	cmpl	$0x2, %eax
00000000003f23db	ja	0x3f2453
00000000003f23dd	movl	%eax, %eax
00000000003f23df	leaq	0x31a88a(%rip), %rcx
00000000003f23e6	movsd	(%rcx,%rax,8), %xmm0
00000000003f23eb	movsd	%xmm0, -0x58(%rbp)
00000000003f23f0	leaq	0x31a891(%rip), %rcx
00000000003f23f7	movsd	(%rcx,%rax,8), %xmm0
00000000003f23fc	leaq	0x31a89d(%rip), %rcx
00000000003f2403	movsd	(%rcx,%rax,8), %xmm1
00000000003f2408	leaq	0x31a8a9(%rip), %rcx
00000000003f240f	movsd	(%rcx,%rax,8), %xmm2
00000000003f2414	movsd	%xmm2, -0x60(%rbp)
00000000003f2419	leaq	0x31a8b0(%rip), %rcx
00000000003f2420	leaq	0x31a8c1(%rip), %rdx
00000000003f2427	movapd	%xmm0, -0xa0(%rbp)
00000000003f242f	movapd	%xmm1, -0x90(%rbp)
00000000003f2437	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000003f243b	movapd	%xmm0, -0xf0(%rbp)
00000000003f2443	movsd	(%rdx,%rax,8), %xmm0
00000000003f2448	movhps	(%rcx,%rax,8), %xmm0            ## xmm0 = xmm0[0,1],mem[0,1]
00000000003f244c	movaps	%xmm0, -0x100(%rbp)
00000000003f2453	movq	-0x70(%rbp), %rax
00000000003f2457	movq	%rax, -0xb0(%rbp)
00000000003f245e	movaps	-0x80(%rbp), %xmm0
00000000003f2462	movaps	%xmm0, -0xc0(%rbp)
00000000003f2469	leaq	0x2f0(%r15), %rdi
00000000003f2470	leaq	-0xc0(%rbp), %rsi
00000000003f2477	xorps	%xmm0, %xmm0
00000000003f247a	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f247f	cmpl	$0x2, %eax
00000000003f2482	je	0x3f24c2
00000000003f2484	cmpl	$0x1, %eax
00000000003f2487	jne	0x3f24f6
00000000003f2489	movsd	0x312f4f(%rip), %xmm1
00000000003f2491	movq	0x31528f(%rip), %xmm0
00000000003f2499	movq	%xmm0, -0x50(%rbp)
00000000003f249e	pxor	%xmm0, %xmm0
00000000003f24a2	movq	%xmm0, -0x48(%rbp)
00000000003f24a7	movq	%xmm0, -0x20(%rbp)
00000000003f24ac	movq	%xmm0, -0x40(%rbp)
00000000003f24b1	movq	%xmm0, -0x38(%rbp)
00000000003f24b6	movsd	%xmm1, -0x28(%rbp)
00000000003f24bb	movsd	%xmm1, -0x30(%rbp)
00000000003f24c0	jmp	0x3f2524
00000000003f24c2	movsd	0x312f16(%rip), %xmm1
00000000003f24ca	movq	0x315256(%rip), %xmm0
00000000003f24d2	movq	%xmm0, -0x20(%rbp)
00000000003f24d7	pxor	%xmm0, %xmm0
00000000003f24db	movq	%xmm0, -0x48(%rbp)
00000000003f24e0	movq	%xmm0, -0x50(%rbp)
00000000003f24e5	movq	%xmm0, -0x28(%rbp)
00000000003f24ea	movsd	%xmm1, -0x40(%rbp)
00000000003f24ef	movsd	%xmm1, -0x38(%rbp)
00000000003f24f4	jmp	0x3f251f
00000000003f24f6	movq	0x312ee2(%rip), %xmm0
00000000003f24fe	movq	%xmm0, -0x28(%rbp)
00000000003f2503	xorpd	%xmm1, %xmm1
00000000003f2507	movsd	%xmm1, -0x20(%rbp)
00000000003f250c	movq	%xmm0, -0x48(%rbp)
00000000003f2511	movq	%xmm0, -0x40(%rbp)
00000000003f2516	pxor	%xmm0, %xmm0
00000000003f251a	movq	%xmm0, -0x38(%rbp)
00000000003f251f	movq	%xmm0, -0x30(%rbp)
00000000003f2524	addq	$0x3f0, %r15                    ## imm = 0x3F0
00000000003f252b	leaq	-0x80(%rbp), %rsi
00000000003f252f	movq	%r15, %rdi
00000000003f2532	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f2537	movq	(%r14), %rcx
00000000003f253a	movq	0x8(%r14), %rdx
00000000003f253e	cmpq	%rcx, %rdx
00000000003f2541	sete	%sil
00000000003f2545	testl	%ebx, %ebx
00000000003f2547	setle	%dil
00000000003f254b	orb	%sil, %dil
00000000003f254e	jne	0x3f2957
00000000003f2554	xorl	%esi, %esi
00000000003f2556	testl	%eax, %eax
00000000003f2558	sete	%sil
00000000003f255c	movapd	-0x90(%rbp), %xmm0
00000000003f2564	movapd	%xmm0, %xmm1
00000000003f2568	movsd	-0x20(%rbp), %xmm2
00000000003f256d	mulsd	%xmm2, %xmm1
00000000003f2571	movapd	%xmm1, -0x120(%rbp)
00000000003f2579	movsd	-0x28(%rbp), %xmm1
00000000003f257e	mulsd	%xmm1, %xmm0
00000000003f2582	movsd	%xmm0, -0xd8(%rbp)
00000000003f258a	movapd	-0xa0(%rbp), %xmm5
00000000003f2592	movapd	%xmm5, %xmm0
00000000003f2596	mulsd	%xmm2, %xmm0
00000000003f259a	movsd	%xmm0, -0xd0(%rbp)
00000000003f25a2	mulsd	%xmm1, %xmm5
00000000003f25a6	movsd	%xmm5, -0xc8(%rbp)
00000000003f25ae	movsd	-0x58(%rbp), %xmm0
00000000003f25b3	mulsd	%xmm0, %xmm2
00000000003f25b7	movsd	%xmm2, -0x20(%rbp)
00000000003f25bc	mulsd	%xmm0, %xmm1
00000000003f25c0	movsd	%xmm1, -0x28(%rbp)
00000000003f25c5	movd	%esi, %xmm0
00000000003f25c9	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
00000000003f25ce	addq	$-0xf8, %rdx
00000000003f25d5	movl	$0x1, %esi
00000000003f25da	movapd	0x31482e(%rip), %xmm1
00000000003f25e2	movsd	0x3148e6(%rip), %xmm3
00000000003f25ea	movapd	0x31481d(%rip), %xmm12
00000000003f25f3	movapd	0x314f65(%rip), %xmm4
00000000003f25fb	psllq	$0x3f, %xmm0
00000000003f2600	movdqa	%xmm0, -0x110(%rbp)
00000000003f2608	xorpd	%xmm8, %xmm8
00000000003f260d	nopl	(%rax)
00000000003f2610	movupd	0x38(%rdx), %xmm6
00000000003f2615	mulpd	-0x100(%rbp), %xmm6
00000000003f261d	movsd	0x48(%rdx), %xmm14
00000000003f2623	mulsd	-0x60(%rbp), %xmm14
00000000003f2629	movapd	%xmm6, %xmm0
00000000003f262d	mulpd	%xmm6, %xmm0
00000000003f2631	movapd	%xmm0, %xmm2
00000000003f2635	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000003f2639	addsd	%xmm0, %xmm2
00000000003f263d	movapd	%xmm14, %xmm0
00000000003f2642	mulsd	%xmm14, %xmm0
00000000003f2647	addsd	%xmm2, %xmm0
00000000003f264b	movapd	%xmm0, %xmm2
00000000003f264f	andpd	%xmm1, %xmm2
00000000003f2653	ucomisd	%xmm2, %xmm3
00000000003f2657	ja	0x3f2940
00000000003f265d	sqrtsd	%xmm0, %xmm0
00000000003f2661	movapd	%xmm0, %xmm2
00000000003f2665	andpd	%xmm12, %xmm2
00000000003f266a	xorl	%edi, %edi
00000000003f266c	movsd	0x3150c4(%rip), %xmm1
00000000003f2674	ucomisd	%xmm2, %xmm1
00000000003f2678	setbe	%r8b
00000000003f267c	ja	0x3f2683
00000000003f267e	divsd	%xmm0, %xmm14
00000000003f2683	testl	%eax, %eax
00000000003f2685	je	0x3f268c
00000000003f2687	xorpd	%xmm4, %xmm14
00000000003f268c	movapd	-0xa0(%rbp), %xmm13
00000000003f2695	mulsd	%xmm14, %xmm13
00000000003f269a	movapd	-0x90(%rbp), %xmm3
00000000003f26a2	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000003f26a6	movapd	%xmm6, %xmm2
00000000003f26aa	divpd	%xmm0, %xmm2
00000000003f26ae	movb	%r8b, %dil
00000000003f26b1	movd	%edi, %xmm0
00000000003f26b5	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
00000000003f26ba	psllq	$0x3f, %xmm0
00000000003f26bf	blendvpd	%xmm0, %xmm2, %xmm6
00000000003f26c4	mulsd	%xmm14, %xmm3
00000000003f26c9	movapd	%xmm6, %xmm2
00000000003f26cd	xorpd	%xmm4, %xmm2
00000000003f26d1	movaps	-0x110(%rbp), %xmm0
00000000003f26d8	blendvpd	%xmm0, %xmm6, %xmm2
00000000003f26dd	movapd	%xmm2, %xmm6
00000000003f26e1	unpckhpd	%xmm2, %xmm6                    ## xmm6 = xmm6[1],xmm2[1]
00000000003f26e5	movsd	-0x58(%rbp), %xmm15
00000000003f26eb	movapd	%xmm15, %xmm0
00000000003f26f0	mulsd	%xmm6, %xmm0
00000000003f26f4	subsd	%xmm0, %xmm13
00000000003f26f9	mulsd	%xmm2, %xmm15
00000000003f26fe	subsd	%xmm3, %xmm15
00000000003f2703	movapd	-0xf0(%rbp), %xmm0
00000000003f270b	mulpd	%xmm2, %xmm0
00000000003f270f	movapd	%xmm0, %xmm10
00000000003f2714	unpckhpd	%xmm0, %xmm10                   ## xmm10 = xmm10[1],xmm0[1]
00000000003f2719	subsd	%xmm0, %xmm10
00000000003f271e	movsd	-0x48(%rbp), %xmm7
00000000003f2723	movapd	%xmm7, %xmm0
00000000003f2727	mulsd	%xmm2, %xmm0
00000000003f272b	movsd	-0x50(%rbp), %xmm4
00000000003f2730	movapd	%xmm4, %xmm11
00000000003f2735	mulsd	%xmm13, %xmm11
00000000003f273a	addsd	%xmm0, %xmm11
00000000003f273f	movsd	-0x30(%rbp), %xmm12
00000000003f2745	movapd	%xmm12, %xmm3
00000000003f274a	mulsd	%xmm2, %xmm3
00000000003f274e	movsd	-0x40(%rbp), %xmm0
00000000003f2753	movapd	%xmm0, %xmm5
00000000003f2757	mulsd	%xmm13, %xmm5
00000000003f275c	addsd	%xmm3, %xmm5
00000000003f2760	movsd	-0x38(%rbp), %xmm1
00000000003f2765	mulsd	%xmm1, %xmm2
00000000003f2769	mulsd	%xmm8, %xmm13
00000000003f276e	addsd	%xmm2, %xmm13
00000000003f2773	movapd	%xmm7, %xmm2
00000000003f2777	mulsd	%xmm6, %xmm2
00000000003f277b	movapd	%xmm4, %xmm9
00000000003f2780	mulsd	%xmm15, %xmm9
00000000003f2785	addsd	%xmm2, %xmm9
00000000003f278a	movapd	%xmm12, %xmm2
00000000003f278f	mulsd	%xmm6, %xmm2
00000000003f2793	movapd	%xmm0, %xmm3
00000000003f2797	mulsd	%xmm15, %xmm3
00000000003f279c	unpcklpd	%xmm3, %xmm11                   ## xmm11 = xmm11[0],xmm3[0]
00000000003f27a1	mulsd	%xmm1, %xmm6
00000000003f27a5	mulsd	%xmm8, %xmm15
00000000003f27aa	addsd	%xmm6, %xmm15
00000000003f27af	movapd	%xmm7, %xmm3
00000000003f27b3	mulsd	%xmm14, %xmm3
00000000003f27b8	movapd	%xmm4, %xmm6
00000000003f27bc	mulsd	%xmm10, %xmm6
00000000003f27c1	addsd	%xmm3, %xmm6
00000000003f27c5	mulsd	%xmm14, %xmm12
00000000003f27ca	movapd	%xmm0, %xmm7
00000000003f27ce	mulsd	%xmm10, %xmm7
00000000003f27d3	addsd	%xmm12, %xmm7
00000000003f27d8	mulsd	%xmm1, %xmm14
00000000003f27dd	mulsd	%xmm8, %xmm10
00000000003f27e2	addsd	%xmm14, %xmm10
00000000003f27e7	movapd	-0x120(%rbp), %xmm4
00000000003f27ef	unpcklpd	%xmm2, %xmm4                    ## xmm4 = xmm4[0],xmm2[0]
00000000003f27f3	addpd	%xmm11, %xmm4
00000000003f27f8	movapd	%xmm4, %xmm14
00000000003f27fd	movsd	0x312bdb(%rip), %xmm0
00000000003f2805	movapd	%xmm0, %xmm11
00000000003f280a	subsd	%xmm4, %xmm11
00000000003f280f	addsd	%xmm0, %xmm4
00000000003f2813	unpckhpd	%xmm14, %xmm14                  ## xmm14 = xmm14[1,1]
00000000003f2818	addsd	%xmm8, %xmm14
00000000003f281d	movapd	%xmm14, %xmm3
00000000003f2822	addsd	%xmm4, %xmm3
00000000003f2826	subsd	%xmm14, %xmm4
00000000003f282b	movapd	%xmm14, %xmm2
00000000003f2830	addsd	%xmm11, %xmm2
00000000003f2835	subsd	%xmm14, %xmm11
00000000003f283a	addsd	-0x28(%rbp), %xmm10
00000000003f2840	addsd	%xmm10, %xmm3
00000000003f2845	subsd	%xmm10, %xmm4
00000000003f284a	subsd	%xmm10, %xmm2
00000000003f284f	addsd	%xmm10, %xmm11
00000000003f2854	addsd	-0xc8(%rbp), %xmm15
00000000003f285d	addsd	%xmm8, %xmm7
00000000003f2862	subsd	%xmm15, %xmm7
00000000003f2867	movapd	0x3145a0(%rip), %xmm12
00000000003f2870	movapd	%xmm12, %xmm10
00000000003f2875	andnpd	%xmm7, %xmm10
00000000003f287a	maxsd	%xmm8, %xmm4
00000000003f287f	sqrtsd	%xmm4, %xmm4
00000000003f2883	movsd	0x31461d(%rip), %xmm1
00000000003f288b	mulsd	%xmm1, %xmm4
00000000003f288f	andpd	%xmm12, %xmm4
00000000003f2894	orpd	%xmm4, %xmm10
00000000003f2899	addsd	-0xd8(%rbp), %xmm13
00000000003f28a2	addsd	-0x20(%rbp), %xmm6
00000000003f28a7	subsd	%xmm6, %xmm13
00000000003f28ac	movapd	%xmm12, %xmm4
00000000003f28b1	andnpd	%xmm13, %xmm4
00000000003f28b6	maxsd	%xmm8, %xmm2
00000000003f28bb	sqrtsd	%xmm2, %xmm2
00000000003f28bf	mulsd	%xmm1, %xmm2
00000000003f28c3	andpd	%xmm12, %xmm2
00000000003f28c8	orpd	%xmm2, %xmm4
00000000003f28cc	unpcklpd	%xmm4, %xmm10                   ## xmm10 = xmm10[0],xmm4[0]
00000000003f28d1	movapd	0x314c87(%rip), %xmm4
00000000003f28d9	addsd	%xmm8, %xmm5
00000000003f28de	addsd	-0xd0(%rbp), %xmm9
00000000003f28e7	subsd	%xmm5, %xmm9
00000000003f28ec	movapd	%xmm12, %xmm0
00000000003f28f1	andnpd	%xmm9, %xmm0
00000000003f28f6	maxsd	%xmm8, %xmm11
00000000003f28fb	xorps	%xmm2, %xmm2
00000000003f28fe	sqrtsd	%xmm11, %xmm2
00000000003f2903	mulsd	%xmm1, %xmm2
00000000003f2907	andpd	%xmm12, %xmm2
00000000003f290c	orpd	%xmm2, %xmm0
00000000003f2910	maxsd	%xmm8, %xmm3
00000000003f2915	xorps	%xmm2, %xmm2
00000000003f2918	sqrtsd	%xmm3, %xmm2
00000000003f291c	mulsd	%xmm1, %xmm2
00000000003f2920	movsd	%xmm2, 0x18(%rdx)
00000000003f2925	movupd	%xmm10, 0x20(%rdx)
00000000003f292b	movlpd	%xmm0, 0x30(%rdx)
00000000003f2930	movapd	0x3144d8(%rip), %xmm1
00000000003f2938	movsd	0x314590(%rip), %xmm3
00000000003f2940	cmpq	%rcx, %rdx
00000000003f2943	je	0x3f2957
00000000003f2945	addq	$-0xf8, %rdx
00000000003f294c	cmpl	%ebx, %esi
00000000003f294e	leal	0x1(%rsi), %esi
00000000003f2951	jl	0x3f2610
00000000003f2957	addq	$0x128, %rsp                    ## imm = 0x128
00000000003f295e	popq	%rbx
00000000003f295f	popq	%r14
00000000003f2961	popq	%r15
00000000003f2963	popq	%rbp
00000000003f2964	retq
00000000003f2965	nopw	%cs:(%rax,%rax)
