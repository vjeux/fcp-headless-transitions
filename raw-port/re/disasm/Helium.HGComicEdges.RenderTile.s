__ZN12HGComicEdges10RenderTileEP6HGTile:
0000000000006450	pushq	%rbp
0000000000006451	movq	%rsp, %rbp
0000000000006454	pushq	%r15
0000000000006456	pushq	%r14
0000000000006458	pushq	%r13
000000000000645a	pushq	%r12
000000000000645c	pushq	%rbx
000000000000645d	subq	$0xf8, %rsp
0000000000006464	movq	%rsi, %rbx
0000000000006467	movq	%rdi, %r15
000000000000646a	movq	%rsi, %rdi
000000000000646d	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
0000000000006472	movq	(%r15), %rcx
0000000000006475	movq	%r15, %rdi
0000000000006478	movq	%rax, %rsi
000000000000647b	callq	*0x138(%rcx)
0000000000006481	movl	%eax, -0x4c(%rbp)
0000000000006484	movdqa	(%rbx), %xmm0
0000000000006488	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
000000000000648d	psubd	%xmm0, %xmm1
0000000000006491	pextrd	$0x1, %xmm1, %eax
0000000000006497	movl	%eax, -0x44(%rbp)
000000000000649a	testl	%eax, %eax
000000000000649c	jle	0x6c49
00000000000064a2	movd	%xmm1, %eax
00000000000064a6	testl	%eax, %eax
00000000000064a8	jle	0x6c49
00000000000064ae	cvtdq2ps	%xmm0, %xmm1
00000000000064b1	mulps	0x3c3bf8(%rip), %xmm1
00000000000064b8	addps	0x3c3c01(%rip), %xmm1
00000000000064bf	movss	0x198(%r15), %xmm0
00000000000064c8	movss	0x19c(%r15), %xmm2
00000000000064d1	movss	%xmm2, -0x48(%rbp)
00000000000064d6	movaps	%xmm0, %xmm2
00000000000064d9	addss	%xmm0, %xmm2
00000000000064dd	mulss	%xmm2, %xmm0
00000000000064e1	movss	0x3c17d7(%rip), %xmm3
00000000000064e9	divss	%xmm0, %xmm3
00000000000064ed	movss	%xmm3, -0x30(%rbp)
00000000000064f2	movq	0x10(%rbx), %rcx
00000000000064f6	movq	%rcx, -0x68(%rbp)
00000000000064fa	movl	%eax, %eax
00000000000064fc	movq	%rax, -0xe0(%rbp)
0000000000006503	xorl	%eax, %eax
0000000000006505	movaps	%xmm1, %xmm0
0000000000006508	movaps	%xmm1, -0x90(%rbp)
000000000000650f	movss	%xmm2, -0x2c(%rbp)
0000000000006514	jmp	0x654c
0000000000006516	nopw	%cs:(%rax,%rax)
0000000000006520	movaps	-0x120(%rbp), %xmm0
0000000000006527	addps	0x3c1782(%rip), %xmm0
000000000000652e	movslq	0x18(%rbx), %rax
0000000000006532	shlq	$0x4, %rax
0000000000006536	addq	%rax, -0x68(%rbp)
000000000000653a	movq	-0xd8(%rbp), %rax
0000000000006541	incl	%eax
0000000000006543	cmpl	-0x44(%rbp), %eax
0000000000006546	je	0x6c49
000000000000654c	movq	%rax, -0xd8(%rbp)
0000000000006553	xorl	%r12d, %r12d
0000000000006556	movaps	%xmm0, -0x120(%rbp)
000000000000655d	jmp	0x6600
0000000000006562	nopw	%cs:(%rax,%rax)
0000000000006570	movsd	0x3c3a78(%rip), %xmm6
0000000000006578	movaps	0x3c3a71(%rip), %xmm0
000000000000657f	divps	%xmm6, %xmm0
0000000000006582	mulps	%xmm5, %xmm0
0000000000006585	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
0000000000006589	mulss	0x3c3b93(%rip), %xmm1
0000000000006591	addss	%xmm0, %xmm1
0000000000006595	mulss	0x3c3b8b(%rip), %xmm1
000000000000659d	mulss	-0x48(%rbp), %xmm1
00000000000065a2	cmpltss	0x3c3b75(%rip), %xmm1
00000000000065ab	movss	0x3c170d(%rip), %xmm0
00000000000065b3	andnps	%xmm0, %xmm1
00000000000065b6	movaps	-0x80(%rbp), %xmm3
00000000000065ba	blendps	$0x1, %xmm1, %xmm3              ## xmm3 = xmm1[0],xmm3[1,2,3]
00000000000065c0	minps	0x3c1679(%rip), %xmm3
00000000000065c7	xorps	%xmm1, %xmm1
00000000000065ca	maxps	%xmm1, %xmm3
00000000000065cd	movq	%r12, %rax
00000000000065d0	shlq	$0x4, %rax
00000000000065d4	movq	-0x68(%rbp), %rcx
00000000000065d8	movaps	%xmm3, (%rcx,%rax)
00000000000065dc	movaps	-0xa0(%rbp), %xmm3
00000000000065e3	addps	%xmm0, %xmm3
00000000000065e6	incq	%r12
00000000000065e9	cmpq	-0xe0(%rbp), %r12
00000000000065f0	movaps	-0x90(%rbp), %xmm1
00000000000065f7	movaps	%xmm3, %xmm0
00000000000065fa	je	0x6520
0000000000006600	movq	0x60(%rbx), %rcx
0000000000006604	movslq	0x68(%rbx), %rax
0000000000006608	movaps	%xmm0, -0xa0(%rbp)
000000000000660f	movaps	%xmm0, %xmm5
0000000000006612	subps	%xmm1, %xmm5
0000000000006615	movl	-0x4c(%rbp), %r15d
0000000000006619	testl	%r15d, %r15d
000000000000661c	je	0x6730
0000000000006622	cvttps2dq	%xmm5, %xmm0
0000000000006626	movaps	%xmm5, %xmm1
0000000000006629	xorps	%xmm2, %xmm2
000000000000662c	cmpltps	%xmm2, %xmm1
0000000000006630	paddd	%xmm0, %xmm1
0000000000006634	cvtdq2ps	%xmm1, %xmm0
0000000000006637	movaps	%xmm5, %xmm4
000000000000663a	subps	%xmm0, %xmm4
000000000000663d	movd	%xmm1, %edx
0000000000006641	pextrd	$0x1, %xmm1, %esi
0000000000006647	imull	%eax, %esi
000000000000664a	addl	%edx, %esi
000000000000664c	movslq	%esi, %rdx
000000000000664f	shlq	$0x4, %rdx
0000000000006653	leaq	(%rcx,%rdx), %rsi
0000000000006657	movaps	%xmm4, %xmm0
000000000000665a	shufps	$0x0, %xmm4, %xmm0              ## xmm0 = xmm0[0,0],xmm4[0,0]
000000000000665e	movaps	(%rcx,%rdx), %xmm1
0000000000006662	movaps	0x10(%rcx,%rdx), %xmm2
0000000000006667	subps	%xmm1, %xmm2
000000000000666a	mulps	%xmm0, %xmm2
000000000000666d	addps	%xmm1, %xmm2
0000000000006670	shlq	$0x4, %rax
0000000000006674	movaps	(%rax,%rsi), %xmm1
0000000000006678	movaps	0x10(%rax,%rsi), %xmm3
000000000000667d	subps	%xmm1, %xmm3
0000000000006680	mulps	%xmm0, %xmm3
0000000000006683	addps	%xmm1, %xmm3
0000000000006686	subps	%xmm2, %xmm3
0000000000006689	shufps	$0x55, %xmm4, %xmm4             ## xmm4 = xmm4[1,1,1,1]
000000000000668d	mulps	%xmm3, %xmm4
0000000000006690	addps	%xmm2, %xmm4
0000000000006693	movaps	%xmm4, -0x80(%rbp)
0000000000006697	movq	0x50(%rbx), %r13
000000000000669b	movslq	0x58(%rbx), %r14
000000000000669f	testl	%r15d, %r15d
00000000000066a2	je	0x6778
00000000000066a8	cvttps2dq	%xmm5, %xmm0
00000000000066ac	movaps	%xmm5, %xmm1
00000000000066af	xorps	%xmm2, %xmm2
00000000000066b2	cmpltps	%xmm2, %xmm1
00000000000066b6	paddd	%xmm0, %xmm1
00000000000066ba	cvtdq2ps	%xmm1, %xmm0
00000000000066bd	subps	%xmm0, %xmm5
00000000000066c0	pextrd	$0x1, %xmm1, %eax
00000000000066c6	movd	%xmm1, %ecx
00000000000066ca	imull	%r14d, %eax
00000000000066ce	addl	%ecx, %eax
00000000000066d0	cltq
00000000000066d2	shlq	$0x4, %rax
00000000000066d6	leaq	(%rax,%r13), %rcx
00000000000066da	movaps	%xmm5, %xmm0
00000000000066dd	shufps	$0x0, %xmm5, %xmm0              ## xmm0 = xmm0[0,0],xmm5[0,0]
00000000000066e1	movaps	(%r13,%rax), %xmm1
00000000000066e7	movaps	0x10(%r13,%rax), %xmm2
00000000000066ed	subps	%xmm1, %xmm2
00000000000066f0	mulps	%xmm0, %xmm2
00000000000066f3	addps	%xmm1, %xmm2
00000000000066f6	movq	%r14, %rax
00000000000066f9	shlq	$0x4, %rax
00000000000066fd	movaps	(%rax,%rcx), %xmm1
0000000000006701	movaps	0x10(%rax,%rcx), %xmm3
0000000000006706	subps	%xmm1, %xmm3
0000000000006709	mulps	%xmm0, %xmm3
000000000000670c	addps	%xmm1, %xmm3
000000000000670f	subps	%xmm2, %xmm3
0000000000006712	shufps	$0x55, %xmm5, %xmm5             ## xmm5 = xmm5[1,1,1,1]
0000000000006716	mulps	%xmm3, %xmm5
0000000000006719	addps	%xmm2, %xmm5
000000000000671c	jmp	0x67ab
0000000000006721	nopw	%cs:(%rax,%rax)
0000000000006730	movaps	%xmm5, %xmm0
0000000000006733	addps	0x3c1536(%rip), %xmm0
000000000000673a	cvtps2dq	%xmm0, %xmm1
000000000000673e	cvtdq2ps	%xmm1, %xmm2
0000000000006741	cmpltps	%xmm2, %xmm0
0000000000006745	paddd	%xmm1, %xmm0
0000000000006749	movd	%xmm0, %edx
000000000000674d	pextrd	$0x1, %xmm0, %esi
0000000000006753	imull	%eax, %esi
0000000000006756	addl	%edx, %esi
0000000000006758	movslq	%esi, %rax
000000000000675b	shlq	$0x4, %rax
000000000000675f	movaps	(%rcx,%rax), %xmm0
0000000000006763	movaps	%xmm0, -0x80(%rbp)
0000000000006767	movq	0x50(%rbx), %r13
000000000000676b	movslq	0x58(%rbx), %r14
000000000000676f	testl	%r15d, %r15d
0000000000006772	jne	0x66a8
0000000000006778	addps	0x3c14f1(%rip), %xmm5
000000000000677f	cvtps2dq	%xmm5, %xmm0
0000000000006783	cvtdq2ps	%xmm0, %xmm1
0000000000006786	cmpltps	%xmm1, %xmm5
000000000000678a	paddd	%xmm0, %xmm5
000000000000678e	movd	%xmm5, %eax
0000000000006792	pextrd	$0x1, %xmm5, %ecx
0000000000006798	imull	%r14d, %ecx
000000000000679c	addl	%eax, %ecx
000000000000679e	movslq	%ecx, %rax
00000000000067a1	shlq	$0x4, %rax
00000000000067a5	movaps	(%r13,%rax), %xmm5
00000000000067ab	movaps	%xmm5, %xmm0
00000000000067ae	mulps	0x3c392b(%rip), %xmm0
00000000000067b5	movaps	%xmm0, %xmm1
00000000000067b8	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
00000000000067bc	addps	%xmm0, %xmm1
00000000000067bf	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
00000000000067c3	addss	%xmm1, %xmm0
00000000000067c7	movaps	%xmm0, -0x40(%rbp)
00000000000067cb	movaps	%xmm5, %xmm0
00000000000067ce	mulps	0x3c391b(%rip), %xmm0
00000000000067d5	movaps	%xmm0, %xmm2
00000000000067d8	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000000067dc	addps	%xmm0, %xmm2
00000000000067df	movshdup	%xmm2, %xmm1                    ## xmm1 = xmm2[1,1,3,3]
00000000000067e3	addss	%xmm2, %xmm1
00000000000067e7	movaps	%xmm5, -0x60(%rbp)
00000000000067eb	movaps	%xmm5, %xmm0
00000000000067ee	mulps	0x3c390b(%rip), %xmm0
00000000000067f5	movaps	%xmm0, %xmm2
00000000000067f8	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000000067fc	addps	%xmm0, %xmm2
00000000000067ff	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
0000000000006803	addss	%xmm2, %xmm0
0000000000006807	callq	0x3c504e                        ## symbol stub for: _atan2f
000000000000680c	movaps	%xmm0, %xmm1
000000000000680f	addss	0x3c38fd(%rip), %xmm1
0000000000006817	andps	0x3c1412(%rip), %xmm1
000000000000681e	xorps	%xmm2, %xmm2
0000000000006821	cmpordss	%xmm2, %xmm0
0000000000006826	movaps	-0x40(%rbp), %xmm2
000000000000682a	cmpltss	0x3c38e5(%rip), %xmm1
0000000000006833	andps	%xmm0, %xmm1
0000000000006836	movd	%xmm1, %eax
000000000000683a	movaps	%xmm2, %xmm0
000000000000683d	movss	0x3c38d7(%rip), %xmm1
0000000000006845	cmpltps	%xmm1, %xmm0
0000000000006849	movss	0x3c38cf(%rip), %xmm1
0000000000006851	cmpltps	%xmm2, %xmm1
0000000000006855	orps	%xmm0, %xmm1
0000000000006858	movd	%xmm1, %ecx
000000000000685c	orl	%eax, %ecx
000000000000685e	testb	$0x1, %cl
0000000000006861	jne	0x6867
0000000000006863	movaps	%xmm2, -0x60(%rbp)
0000000000006867	movss	0x3c1451(%rip), %xmm6
000000000000686f	movss	-0x2c(%rbp), %xmm2
0000000000006874	movss	0x3c1444(%rip), %xmm0
000000000000687c	movaps	0x3c384d(%rip), %xmm3
0000000000006883	movss	0x3c143d(%rip), %xmm4
000000000000688b	jne	0x6894
000000000000688d	movaps	0x3c384c(%rip), %xmm6
0000000000006894	ucomiss	%xmm0, %xmm2
0000000000006897	movaps	-0x60(%rbp), %xmm5
000000000000689b	insertps	$0x1c, %xmm5, %xmm5             ## xmm5 = xmm5[0,0],zero,zero
00000000000068a1	jb	0x6570
00000000000068a7	movaps	-0x80(%rbp), %xmm7
00000000000068ab	movshdup	%xmm7, %xmm2                    ## xmm2 = xmm7[1,1,3,3]
00000000000068af	movhlps	%xmm7, %xmm7                    ## xmm7 = xmm7[1,1]
00000000000068b2	addss	%xmm7, %xmm7
00000000000068b6	movss	0x3c3852(%rip), %xmm1
00000000000068be	addss	%xmm1, %xmm7
00000000000068c2	movaps	%xmm7, -0xf0(%rbp)
00000000000068c9	addss	%xmm2, %xmm2
00000000000068cd	addss	%xmm1, %xmm2
00000000000068d1	xorps	%xmm3, %xmm2
00000000000068d4	movaps	%xmm2, -0x100(%rbp)
00000000000068db	testl	%r15d, %r15d
00000000000068de	movaps	%xmm6, -0x110(%rbp)
00000000000068e5	je	0x6ae3
00000000000068eb	movq	%r14, %r15
00000000000068ee	shlq	$0x4, %r15
00000000000068f2	movaps	%xmm0, %xmm1
00000000000068f5	movsd	0x3c36f3(%rip), %xmm6
00000000000068fd	nopl	(%rax)
0000000000006900	movaps	%xmm1, -0x40(%rbp)
0000000000006904	movaps	%xmm6, -0xd0(%rbp)
000000000000690b	movaps	%xmm5, -0x60(%rbp)
000000000000690f	movaps	%xmm1, %xmm0
0000000000006912	xorps	%xmm3, %xmm0
0000000000006915	mulss	%xmm1, %xmm0
0000000000006919	mulss	%xmm1, %xmm0
000000000000691d	movaps	%xmm0, -0xb0(%rbp)
0000000000006924	mulss	%xmm4, %xmm0
0000000000006928	callq	0x3c50fc                        ## symbol stub for: _expf
000000000000692d	movaps	%xmm0, -0xc0(%rbp)
0000000000006934	movaps	-0xb0(%rbp), %xmm0
000000000000693b	mulss	-0x30(%rbp), %xmm0
0000000000006940	callq	0x3c50fc                        ## symbol stub for: _expf
0000000000006945	movaps	-0xf0(%rbp), %xmm1
000000000000694c	mulss	-0x40(%rbp), %xmm1
0000000000006951	movaps	-0x40(%rbp), %xmm2
0000000000006955	mulss	-0x100(%rbp), %xmm2
000000000000695d	insertps	$0x1c, %xmm2, %xmm1             ## xmm1 = xmm1[0],xmm2[0],zero,zero
0000000000006963	movaps	-0xa0(%rbp), %xmm8
000000000000696b	movaps	%xmm8, %xmm2
000000000000696f	subps	%xmm1, %xmm2
0000000000006972	movaps	-0x90(%rbp), %xmm7
0000000000006979	subps	%xmm7, %xmm2
000000000000697c	cvttps2dq	%xmm2, %xmm3
0000000000006980	movaps	%xmm2, %xmm4
0000000000006983	xorps	%xmm6, %xmm6
0000000000006986	cmpltps	%xmm6, %xmm4
000000000000698a	paddd	%xmm3, %xmm4
000000000000698e	cvtdq2ps	%xmm4, %xmm3
0000000000006991	movd	%xmm4, %eax
0000000000006995	pextrd	$0x1, %xmm4, %ecx
000000000000699b	subps	%xmm3, %xmm2
000000000000699e	imull	%r14d, %ecx
00000000000069a2	addl	%eax, %ecx
00000000000069a4	movslq	%ecx, %rcx
00000000000069a7	shlq	$0x4, %rcx
00000000000069ab	leaq	(%rcx,%r13), %rax
00000000000069af	movaps	%xmm2, %xmm5
00000000000069b2	shufps	$0x0, %xmm2, %xmm5              ## xmm5 = xmm5[0,0],xmm2[0,0]
00000000000069b6	movaps	(%r13,%rcx), %xmm4
00000000000069bc	movaps	0x10(%r13,%rcx), %xmm3
00000000000069c2	addps	%xmm8, %xmm1
00000000000069c6	subps	%xmm7, %xmm1
00000000000069c9	movaps	(%r15,%rax), %xmm7
00000000000069ce	cvttps2dq	%xmm1, %xmm8
00000000000069d3	movaps	%xmm1, %xmm9
00000000000069d7	cmpltps	%xmm6, %xmm9
00000000000069dc	movaps	0x10(%r15,%rax), %xmm6
00000000000069e2	paddd	%xmm8, %xmm9
00000000000069e7	cvtdq2ps	%xmm9, %xmm8
00000000000069eb	subps	%xmm8, %xmm1
00000000000069ef	subps	%xmm4, %xmm3
00000000000069f2	movd	%xmm9, %eax
00000000000069f7	pextrd	$0x1, %xmm9, %ecx
00000000000069fe	subps	%xmm7, %xmm6
0000000000006a01	imull	%r14d, %ecx
0000000000006a05	addl	%eax, %ecx
0000000000006a07	movslq	%ecx, %rax
0000000000006a0a	mulps	%xmm5, %xmm3
0000000000006a0d	shlq	$0x4, %rax
0000000000006a11	leaq	(%rax,%r13), %rcx
0000000000006a15	movaps	%xmm1, %xmm8
0000000000006a19	mulps	%xmm5, %xmm6
0000000000006a1c	shufps	$0x0, %xmm1, %xmm8              ## xmm8 = xmm8[0,0],xmm1[0,0]
0000000000006a21	movaps	(%r13,%rax), %xmm5
0000000000006a27	movaps	0x10(%r13,%rax), %xmm9
0000000000006a2d	addps	%xmm4, %xmm3
0000000000006a30	subps	%xmm5, %xmm9
0000000000006a34	mulps	%xmm8, %xmm9
0000000000006a38	movaps	(%r15,%rcx), %xmm4
0000000000006a3d	addps	%xmm5, %xmm9
0000000000006a41	movaps	0x10(%r15,%rcx), %xmm5
0000000000006a47	subps	%xmm4, %xmm5
0000000000006a4a	mulps	%xmm8, %xmm5
0000000000006a4e	addps	%xmm7, %xmm6
0000000000006a51	addps	%xmm4, %xmm5
0000000000006a54	movss	0x3c126c(%rip), %xmm4
0000000000006a5c	subps	%xmm3, %xmm6
0000000000006a5f	shufps	$0x55, %xmm2, %xmm2             ## xmm2 = xmm2[1,1,1,1]
0000000000006a63	mulps	%xmm6, %xmm2
0000000000006a66	movaps	-0xd0(%rbp), %xmm6
0000000000006a6d	subps	%xmm9, %xmm5
0000000000006a71	shufps	$0x55, %xmm1, %xmm1             ## xmm1 = xmm1[1,1,1,1]
0000000000006a75	mulps	%xmm5, %xmm1
0000000000006a78	movaps	-0x60(%rbp), %xmm5
0000000000006a7c	addps	%xmm3, %xmm2
0000000000006a7f	movss	0x3c1239(%rip), %xmm3
0000000000006a87	addps	%xmm9, %xmm1
0000000000006a8b	addps	%xmm2, %xmm1
0000000000006a8e	movss	-0x2c(%rbp), %xmm2
0000000000006a93	mulps	-0x110(%rbp), %xmm1
0000000000006a9a	movaps	-0xc0(%rbp), %xmm7
0000000000006aa1	insertps	$0x1c, %xmm0, %xmm7             ## xmm7 = xmm7[0],xmm0[0],zero,zero
0000000000006aa7	movaps	%xmm1, %xmm0
0000000000006aaa	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
0000000000006aae	addps	%xmm1, %xmm0
0000000000006ab1	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
0000000000006ab5	addss	%xmm0, %xmm1
0000000000006ab9	shufps	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
0000000000006abd	mulps	%xmm7, %xmm1
0000000000006ac0	addps	%xmm7, %xmm6
0000000000006ac3	addps	%xmm1, %xmm5
0000000000006ac6	movaps	-0x40(%rbp), %xmm1
0000000000006aca	addss	%xmm3, %xmm1
0000000000006ace	movaps	0x3c35fb(%rip), %xmm3
0000000000006ad5	ucomiss	%xmm1, %xmm2
0000000000006ad8	jae	0x6900
0000000000006ade	jmp	0x6578
0000000000006ae3	movaps	%xmm0, %xmm7
0000000000006ae6	movsd	0x3c3502(%rip), %xmm6
0000000000006aee	nop
0000000000006af0	movaps	%xmm7, -0x40(%rbp)
0000000000006af4	movaps	%xmm6, -0xd0(%rbp)
0000000000006afb	movaps	%xmm5, -0x60(%rbp)
0000000000006aff	movaps	%xmm7, %xmm0
0000000000006b02	xorps	%xmm3, %xmm0
0000000000006b05	mulss	%xmm7, %xmm0
0000000000006b09	mulss	%xmm7, %xmm0
0000000000006b0d	movaps	%xmm0, -0xb0(%rbp)
0000000000006b14	mulss	%xmm4, %xmm0
0000000000006b18	callq	0x3c50fc                        ## symbol stub for: _expf
0000000000006b1d	movaps	%xmm0, -0xc0(%rbp)
0000000000006b24	movaps	-0xb0(%rbp), %xmm0
0000000000006b2b	mulss	-0x30(%rbp), %xmm0
0000000000006b30	callq	0x3c50fc                        ## symbol stub for: _expf
0000000000006b35	movaps	-0xf0(%rbp), %xmm1
0000000000006b3c	movaps	-0x40(%rbp), %xmm2
0000000000006b40	mulss	-0x40(%rbp), %xmm1
0000000000006b45	mulss	-0x100(%rbp), %xmm2
0000000000006b4d	insertps	$0x1c, %xmm2, %xmm1             ## xmm1 = xmm1[0],xmm2[0],zero,zero
0000000000006b53	movaps	-0xa0(%rbp), %xmm7
0000000000006b5a	movaps	%xmm7, %xmm2
0000000000006b5d	subps	%xmm1, %xmm2
0000000000006b60	movaps	-0x90(%rbp), %xmm6
0000000000006b67	subps	%xmm6, %xmm2
0000000000006b6a	movaps	0x3c10ff(%rip), %xmm5
0000000000006b71	addps	%xmm5, %xmm2
0000000000006b74	cvtps2dq	%xmm2, %xmm3
0000000000006b78	cvtdq2ps	%xmm3, %xmm4
0000000000006b7b	cmpltps	%xmm4, %xmm2
0000000000006b7f	movss	0x3c1141(%rip), %xmm4
0000000000006b87	paddd	%xmm3, %xmm2
0000000000006b8b	addps	%xmm7, %xmm1
0000000000006b8e	movaps	-0x40(%rbp), %xmm7
0000000000006b92	movd	%xmm2, %eax
0000000000006b96	subps	%xmm6, %xmm1
0000000000006b99	movaps	-0xd0(%rbp), %xmm6
0000000000006ba0	addps	%xmm5, %xmm1
0000000000006ba3	movaps	-0x60(%rbp), %xmm5
0000000000006ba7	pextrd	$0x1, %xmm2, %ecx
0000000000006bad	cvtps2dq	%xmm1, %xmm2
0000000000006bb1	cvtdq2ps	%xmm2, %xmm3
0000000000006bb4	cmpltps	%xmm3, %xmm1
0000000000006bb8	movss	0x3c1100(%rip), %xmm3
0000000000006bc0	imull	%r14d, %ecx
0000000000006bc4	paddd	%xmm2, %xmm1
0000000000006bc8	pextrd	$0x1, %xmm1, %edx
0000000000006bce	addl	%eax, %ecx
0000000000006bd0	movd	%xmm1, %eax
0000000000006bd4	imull	%r14d, %edx
0000000000006bd8	addl	%eax, %edx
0000000000006bda	movslq	%ecx, %rax
0000000000006bdd	shlq	$0x4, %rax
0000000000006be1	movslq	%edx, %rcx
0000000000006be4	shlq	$0x4, %rcx
0000000000006be8	movaps	(%r13,%rax), %xmm1
0000000000006bee	addps	(%r13,%rcx), %xmm1
0000000000006bf4	mulps	-0x110(%rbp), %xmm1
0000000000006bfb	movaps	%xmm1, %xmm2
0000000000006bfe	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
0000000000006c02	addps	%xmm1, %xmm2
0000000000006c05	movshdup	%xmm2, %xmm1                    ## xmm1 = xmm2[1,1,3,3]
0000000000006c09	movaps	-0xc0(%rbp), %xmm8
0000000000006c11	insertps	$0x1c, %xmm0, %xmm8             ## xmm8 = xmm8[0],xmm0[0],zero,zero
0000000000006c18	addss	%xmm2, %xmm1
0000000000006c1c	movss	-0x2c(%rbp), %xmm2
0000000000006c21	shufps	$0x0, %xmm1, %xmm1              ## xmm1 = xmm1[0,0,0,0]
0000000000006c25	mulps	%xmm8, %xmm1
0000000000006c29	addps	%xmm8, %xmm6
0000000000006c2d	addss	%xmm3, %xmm7
0000000000006c31	movaps	0x3c3498(%rip), %xmm3
0000000000006c38	ucomiss	%xmm7, %xmm2
0000000000006c3b	addps	%xmm1, %xmm5
0000000000006c3e	jae	0x6af0
0000000000006c44	jmp	0x6578
0000000000006c49	xorl	%eax, %eax
0000000000006c4b	addq	$0xf8, %rsp
0000000000006c52	popq	%rbx
0000000000006c53	popq	%r12
0000000000006c55	popq	%r13
0000000000006c57	popq	%r14
0000000000006c59	popq	%r15
0000000000006c5b	popq	%rbp
0000000000006c5c	retq
0000000000006c5d	nopl	(%rax)
