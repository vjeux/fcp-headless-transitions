__ZN15HGComicQuantize10RenderTileEP6HGTile:
00000000000076a0	pushq	%rbp
00000000000076a1	movq	%rsp, %rbp
00000000000076a4	pushq	%r15
00000000000076a6	pushq	%r14
00000000000076a8	pushq	%r13
00000000000076aa	pushq	%r12
00000000000076ac	pushq	%rbx
00000000000076ad	subq	$0xa8, %rsp
00000000000076b4	movq	%rsi, %rbx
00000000000076b7	movq	%rdi, %r15
00000000000076ba	movss	0x19c(%rdi), %xmm0
00000000000076c2	movss	%xmm0, -0x70(%rbp)
00000000000076c7	movq	%rsi, %rdi
00000000000076ca	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000000076cf	movq	(%r15), %rcx
00000000000076d2	movq	%r15, %rdi
00000000000076d5	movq	%rax, %rsi
00000000000076d8	callq	*0x138(%rcx)
00000000000076de	movl	%eax, %r14d
00000000000076e1	movdqa	(%rbx), %xmm0
00000000000076e5	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
00000000000076ea	psubd	%xmm0, %xmm1
00000000000076ee	pextrd	$0x1, %xmm1, %eax
00000000000076f4	movl	%eax, -0x54(%rbp)
00000000000076f7	testl	%eax, %eax
00000000000076f9	jle	0x7d98
00000000000076ff	movd	%xmm1, %eax
0000000000007703	testl	%eax, %eax
0000000000007705	jle	0x7d98
000000000000770b	cvtdq2ps	%xmm0, %xmm0
000000000000770e	mulps	0x3c299b(%rip), %xmm0
0000000000007715	addps	0x3c29a4(%rip), %xmm0
000000000000771c	movss	0x198(%r15), %xmm1
0000000000007725	movss	0x3c0593(%rip), %xmm2
000000000000772d	movaps	%xmm2, %xmm3
0000000000007730	movss	%xmm1, -0x5c(%rbp)
0000000000007735	divss	%xmm1, %xmm3
0000000000007739	movss	%xmm3, -0x58(%rbp)
000000000000773e	divss	-0x70(%rbp), %xmm2
0000000000007743	shufps	$0x0, %xmm2, %xmm2              ## xmm2 = xmm2[0,0,0,0]
0000000000007747	movaps	%xmm2, -0xb0(%rbp)
000000000000774e	movq	0x10(%rbx), %r15
0000000000007752	movl	%eax, %r13d
0000000000007755	shlq	$0x4, %r13
0000000000007759	xorl	%eax, %eax
000000000000775b	movaps	%xmm0, -0xc0(%rbp)
0000000000007762	jmp	0x7798
0000000000007764	nopw	%cs:(%rax,%rax)
0000000000007770	movaps	-0x90(%rbp), %xmm0
0000000000007777	addps	0x3c0532(%rip), %xmm0
000000000000777e	movslq	0x18(%rbx), %rax
0000000000007782	shlq	$0x4, %rax
0000000000007786	addq	%rax, %r15
0000000000007789	movq	-0x78(%rbp), %rax
000000000000778d	incl	%eax
000000000000778f	cmpl	-0x54(%rbp), %eax
0000000000007792	je	0x7d98
0000000000007798	movq	%rax, -0x78(%rbp)
000000000000779c	xorl	%r12d, %r12d
000000000000779f	movaps	%xmm0, -0x90(%rbp)
00000000000077a6	jmp	0x7823
00000000000077a8	nopl	(%rax,%rax)
00000000000077b0	movss	0x3c2afc(%rip), %xmm1
00000000000077b8	movaps	%xmm3, -0x40(%rbp)
00000000000077bc	callq	0x3c54f2                        ## symbol stub for: _powf
00000000000077c1	movaps	-0x40(%rbp), %xmm3
00000000000077c5	mulss	0x3c2aa7(%rip), %xmm0
00000000000077cd	addss	0x3c2ae3(%rip), %xmm0
00000000000077d5	movaps	-0x70(%rbp), %xmm1
00000000000077d9	movaps	-0x50(%rbp), %xmm2
00000000000077dd	insertps	$0x10, %xmm3, %xmm2             ## xmm2 = xmm2[0],xmm3[0],xmm2[2,3]
00000000000077e3	insertps	$0x20, %xmm0, %xmm2             ## xmm2 = xmm2[0,1],xmm0[0],xmm2[3]
00000000000077e9	blendps	$0x8, %xmm1, %xmm2              ## xmm2 = xmm2[0,1,2],xmm1[3]
00000000000077ef	minps	0x3c044a(%rip), %xmm2
00000000000077f6	xorps	%xmm0, %xmm0
00000000000077f9	maxps	%xmm0, %xmm2
00000000000077fc	movaps	%xmm2, (%r15,%r12)
0000000000007801	movss	0x3c04b7(%rip), %xmm0
0000000000007809	movaps	-0xd0(%rbp), %xmm1
0000000000007810	addps	%xmm0, %xmm1
0000000000007813	movaps	%xmm1, %xmm0
0000000000007816	addq	$0x10, %r12
000000000000781a	cmpq	%r12, %r13
000000000000781d	je	0x7770
0000000000007823	movaps	-0xb0(%rbp), %xmm4
000000000000782a	movaps	%xmm0, -0xd0(%rbp)
0000000000007831	mulps	%xmm0, %xmm4
0000000000007834	movq	0x50(%rbx), %rcx
0000000000007838	movslq	0x58(%rbx), %rax
000000000000783c	subps	-0xc0(%rbp), %xmm4
0000000000007843	testl	%r14d, %r14d
0000000000007846	je	0x7930
000000000000784c	cvttps2dq	%xmm4, %xmm0
0000000000007850	movaps	%xmm4, %xmm1
0000000000007853	xorps	%xmm2, %xmm2
0000000000007856	cmpltps	%xmm2, %xmm1
000000000000785a	paddd	%xmm0, %xmm1
000000000000785e	cvtdq2ps	%xmm1, %xmm0
0000000000007861	subps	%xmm0, %xmm4
0000000000007864	movd	%xmm1, %edx
0000000000007868	pextrd	$0x1, %xmm1, %esi
000000000000786e	imull	%eax, %esi
0000000000007871	addl	%edx, %esi
0000000000007873	movslq	%esi, %rdx
0000000000007876	shlq	$0x4, %rdx
000000000000787a	leaq	(%rcx,%rdx), %rsi
000000000000787e	movaps	%xmm4, %xmm0
0000000000007881	shufps	$0x0, %xmm4, %xmm0              ## xmm0 = xmm0[0,0],xmm4[0,0]
0000000000007885	movaps	(%rcx,%rdx), %xmm1
0000000000007889	movaps	0x10(%rcx,%rdx), %xmm2
000000000000788e	subps	%xmm1, %xmm2
0000000000007891	mulps	%xmm0, %xmm2
0000000000007894	addps	%xmm1, %xmm2
0000000000007897	shlq	$0x4, %rax
000000000000789b	movaps	(%rax,%rsi), %xmm1
000000000000789f	movaps	0x10(%rax,%rsi), %xmm3
00000000000078a4	subps	%xmm1, %xmm3
00000000000078a7	mulps	%xmm0, %xmm3
00000000000078aa	addps	%xmm1, %xmm3
00000000000078ad	subps	%xmm2, %xmm3
00000000000078b0	shufps	$0x55, %xmm4, %xmm4             ## xmm4 = xmm4[1,1,1,1]
00000000000078b4	mulps	%xmm3, %xmm4
00000000000078b7	addps	%xmm2, %xmm4
00000000000078ba	ucomiss	0x3c29a7(%rip), %xmm4
00000000000078c1	movaps	%xmm4, -0x70(%rbp)
00000000000078c5	jbe	0x7971
00000000000078cb	movaps	%xmm4, %xmm0
00000000000078ce	addss	0x3c299a(%rip), %xmm0
00000000000078d6	divss	0x3c2996(%rip), %xmm0
00000000000078de	movss	0x3c2992(%rip), %xmm1
00000000000078e6	callq	0x3c54f2                        ## symbol stub for: _powf
00000000000078eb	movaps	-0x70(%rbp), %xmm4
00000000000078ef	movaps	%xmm0, -0x40(%rbp)
00000000000078f3	movshdup	%xmm4, %xmm1                    ## xmm1 = xmm4[1,1,3,3]
00000000000078f7	ucomiss	0x3c296a(%rip), %xmm1
00000000000078fe	ja	0x7991
0000000000007904	divss	0x3c2960(%rip), %xmm1
000000000000790c	movaps	%xmm4, %xmm0
000000000000790f	unpckhpd	%xmm4, %xmm0                    ## xmm0 = xmm0[1],xmm4[1]
0000000000007913	ucomiss	0x3c294e(%rip), %xmm0
000000000000791a	ja	0x79cc
0000000000007920	divss	0x3c2944(%rip), %xmm0
0000000000007928	jmp	0x79f1
000000000000792d	nopl	(%rax)
0000000000007930	addps	0x3c0339(%rip), %xmm4
0000000000007937	cvtps2dq	%xmm4, %xmm0
000000000000793b	cvtdq2ps	%xmm0, %xmm1
000000000000793e	cmpltps	%xmm1, %xmm4
0000000000007942	paddd	%xmm0, %xmm4
0000000000007946	movd	%xmm4, %edx
000000000000794a	pextrd	$0x1, %xmm4, %esi
0000000000007950	imull	%eax, %esi
0000000000007953	addl	%edx, %esi
0000000000007955	movslq	%esi, %rax
0000000000007958	shlq	$0x4, %rax
000000000000795c	movaps	(%rcx,%rax), %xmm4
0000000000007960	ucomiss	0x3c2901(%rip), %xmm4
0000000000007967	movaps	%xmm4, -0x70(%rbp)
000000000000796b	ja	0x78cb
0000000000007971	movaps	%xmm4, %xmm0
0000000000007974	divss	0x3c28f0(%rip), %xmm0
000000000000797c	movaps	%xmm0, -0x40(%rbp)
0000000000007980	movshdup	%xmm4, %xmm1                    ## xmm1 = xmm4[1,1,3,3]
0000000000007984	ucomiss	0x3c28dd(%rip), %xmm1
000000000000798b	jbe	0x7904
0000000000007991	addss	0x3c28d7(%rip), %xmm1
0000000000007999	divss	0x3c28d3(%rip), %xmm1
00000000000079a1	movaps	%xmm1, %xmm0
00000000000079a4	movss	0x3c28cc(%rip), %xmm1
00000000000079ac	callq	0x3c54f2                        ## symbol stub for: _powf
00000000000079b1	movaps	-0x70(%rbp), %xmm4
00000000000079b5	movaps	%xmm0, %xmm1
00000000000079b8	movaps	%xmm4, %xmm0
00000000000079bb	unpckhpd	%xmm4, %xmm0                    ## xmm0 = xmm0[1],xmm4[1]
00000000000079bf	ucomiss	0x3c28a2(%rip), %xmm0
00000000000079c6	jbe	0x7920
00000000000079cc	addss	0x3c289c(%rip), %xmm0
00000000000079d4	divss	0x3c2898(%rip), %xmm0
00000000000079dc	movaps	%xmm1, -0x50(%rbp)
00000000000079e0	movss	0x3c2890(%rip), %xmm1
00000000000079e8	callq	0x3c54f2                        ## symbol stub for: _powf
00000000000079ed	movaps	-0x50(%rbp), %xmm1
00000000000079f1	movaps	-0x40(%rbp), %xmm3
00000000000079f5	insertps	$0x1c, %xmm1, %xmm3             ## xmm3 = xmm3[0],xmm1[0],zero,zero
00000000000079fb	insertps	$0x28, %xmm0, %xmm3             ## xmm3 = xmm3[0,1],xmm0[0],zero
0000000000007a01	movaps	%xmm3, %xmm0
0000000000007a04	mulps	0x3c2755(%rip), %xmm0
0000000000007a0b	movaps	%xmm0, %xmm2
0000000000007a0e	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
0000000000007a12	addps	%xmm0, %xmm2
0000000000007a15	movaps	%xmm3, %xmm0
0000000000007a18	mulps	0x3c26c1(%rip), %xmm0
0000000000007a1f	movaps	%xmm0, %xmm1
0000000000007a22	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000007a26	addps	%xmm0, %xmm1
0000000000007a29	haddps	%xmm1, %xmm2
0000000000007a2d	mulps	0x3c273c(%rip), %xmm3
0000000000007a34	movaps	%xmm3, %xmm0
0000000000007a37	unpckhpd	%xmm3, %xmm0                    ## xmm0 = xmm0[1],xmm3[1]
0000000000007a3b	addps	%xmm3, %xmm0
0000000000007a3e	haddps	%xmm0, %xmm0
0000000000007a42	shufps	$0xc8, %xmm0, %xmm2             ## xmm2 = xmm2[0,2],xmm0[0,3]
0000000000007a46	mulps	0x3c2733(%rip), %xmm2
0000000000007a4d	divps	0x3c273c(%rip), %xmm2
0000000000007a54	ucomiss	0x3c2821(%rip), %xmm2
0000000000007a5b	movaps	%xmm2, -0x40(%rbp)
0000000000007a5f	jbe	0x7ac0
0000000000007a61	movaps	%xmm2, %xmm0
0000000000007a64	movss	0x3c281c(%rip), %xmm1
0000000000007a6c	callq	0x3c54f2                        ## symbol stub for: _powf
0000000000007a71	movaps	-0x40(%rbp), %xmm2
0000000000007a75	movaps	%xmm0, -0x50(%rbp)
0000000000007a79	movshdup	%xmm2, %xmm1                    ## xmm1 = xmm2[1,1,3,3]
0000000000007a7d	ucomiss	0x3c27f8(%rip), %xmm1
0000000000007a84	ja	0x7ae4
0000000000007a86	mulss	0x3c27f2(%rip), %xmm1
0000000000007a8e	addss	0x3c27ee(%rip), %xmm1
0000000000007a96	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
0000000000007a99	ucomiss	0x3c27dc(%rip), %xmm2
0000000000007aa0	ja	0x7b07
0000000000007aa2	mulss	0x3c27d6(%rip), %xmm2
0000000000007aaa	addss	0x3c27d2(%rip), %xmm2
0000000000007ab2	jmp	0x7b22
0000000000007ab4	nopw	%cs:(%rax,%rax)
0000000000007ac0	movaps	%xmm2, %xmm0
0000000000007ac3	mulss	0x3c27b5(%rip), %xmm0
0000000000007acb	addss	0x3c27b1(%rip), %xmm0
0000000000007ad3	movaps	%xmm0, -0x50(%rbp)
0000000000007ad7	movshdup	%xmm2, %xmm1                    ## xmm1 = xmm2[1,1,3,3]
0000000000007adb	ucomiss	0x3c279a(%rip), %xmm1
0000000000007ae2	jbe	0x7a86
0000000000007ae4	movaps	%xmm1, %xmm0
0000000000007ae7	movss	0x3c2799(%rip), %xmm1
0000000000007aef	callq	0x3c54f2                        ## symbol stub for: _powf
0000000000007af4	movaps	-0x40(%rbp), %xmm2
0000000000007af8	movaps	%xmm0, %xmm1
0000000000007afb	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
0000000000007afe	ucomiss	0x3c2777(%rip), %xmm2
0000000000007b05	jbe	0x7aa2
0000000000007b07	movaps	%xmm2, %xmm0
0000000000007b0a	movaps	%xmm1, -0x40(%rbp)
0000000000007b0e	movss	0x3c2772(%rip), %xmm1
0000000000007b16	callq	0x3c54f2                        ## symbol stub for: _powf
0000000000007b1b	movaps	-0x40(%rbp), %xmm1
0000000000007b1f	movaps	%xmm0, %xmm2
0000000000007b22	movaps	%xmm1, %xmm0
0000000000007b25	mulss	0x3c275f(%rip), %xmm0
0000000000007b2d	addss	0x3c275b(%rip), %xmm0
0000000000007b35	movaps	-0x50(%rbp), %xmm4
0000000000007b39	insertps	$0x10, %xmm1, %xmm4             ## xmm4 = xmm4[0],xmm1[0],xmm4[2,3]
0000000000007b3f	insertps	$0x10, %xmm2, %xmm1             ## xmm1 = xmm1[0],xmm2[0],xmm1[2,3]
0000000000007b45	subps	%xmm1, %xmm4
0000000000007b48	movss	0x3c2744(%rip), %xmm3
0000000000007b50	divss	%xmm3, %xmm0
0000000000007b54	mulps	0x3c2645(%rip), %xmm4
0000000000007b5b	divps	0x3c264e(%rip), %xmm4
0000000000007b62	movaps	0x3c2487(%rip), %xmm1
0000000000007b69	mulps	%xmm1, %xmm4
0000000000007b6c	addps	%xmm1, %xmm4
0000000000007b6f	xorps	%xmm1, %xmm1
0000000000007b72	blendps	$0xe, %xmm1, %xmm0              ## xmm0 = xmm0[0],xmm1[1,2,3]
0000000000007b78	shufps	$0x4c, %xmm4, %xmm0             ## xmm0 = xmm0[0,3],xmm4[0,1]
0000000000007b7c	shufps	$0x78, %xmm0, %xmm0             ## xmm0 = xmm0[0,2,3,1]
0000000000007b80	maxps	%xmm1, %xmm0
0000000000007b83	minps	0x3c00b6(%rip), %xmm0
0000000000007b8a	movss	-0x5c(%rbp), %xmm1
0000000000007b8f	mulss	%xmm0, %xmm1
0000000000007b93	addss	0x3c012d(%rip), %xmm1
0000000000007b9b	xorps	%xmm2, %xmm2
0000000000007b9e	roundss	$0x9, %xmm1, %xmm2
0000000000007ba4	mulss	-0x58(%rbp), %xmm2
0000000000007ba9	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
0000000000007bad	movhlps	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
0000000000007bb0	mulss	%xmm3, %xmm2
0000000000007bb4	movss	0x3c0110(%rip), %xmm3
0000000000007bbc	addss	%xmm3, %xmm1
0000000000007bc0	mulss	0x3c26d0(%rip), %xmm1
0000000000007bc8	addss	%xmm3, %xmm0
0000000000007bcc	divss	0x3c26c8(%rip), %xmm1
0000000000007bd4	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
0000000000007bd8	addss	0x3c26c0(%rip), %xmm2
0000000000007be0	mulps	0x3c25d9(%rip), %xmm0
0000000000007be7	blendps	$0xd, %xmm2, %xmm0              ## xmm0 = xmm2[0],xmm0[1],xmm2[2,3]
0000000000007bed	divps	0x3c25dc(%rip), %xmm0
0000000000007bf4	addss	%xmm0, %xmm1
0000000000007bf8	movshdup	%xmm0, %xmm3                    ## xmm3 = xmm0[1,1,3,3]
0000000000007bfc	movaps	%xmm0, %xmm2
0000000000007bff	subps	%xmm3, %xmm2
0000000000007c02	ucomiss	0x3c269b(%rip), %xmm1
0000000000007c09	movaps	%xmm1, %xmm5
0000000000007c0c	addss	0x3c2694(%rip), %xmm5
0000000000007c14	jbe	0x7c30
0000000000007c16	movaps	%xmm1, %xmm5
0000000000007c19	mulss	%xmm1, %xmm5
0000000000007c1d	mulss	%xmm1, %xmm5
0000000000007c21	jmp	0x7c38
0000000000007c23	nopw	%cs:(%rax,%rax)
0000000000007c30	divss	0x3c2648(%rip), %xmm5
0000000000007c38	movaps	%xmm0, %xmm1
0000000000007c3b	movaps	%xmm2, %xmm3
0000000000007c3e	mulps	%xmm2, %xmm3
0000000000007c41	movaps	%xmm0, %xmm4
0000000000007c44	unpcklps	%xmm3, %xmm0                    ## xmm0 = xmm0[0],xmm3[0],xmm0[1],xmm3[1]
0000000000007c47	mulps	%xmm1, %xmm1
0000000000007c4a	insertps	$0x1c, %xmm2, %xmm4             ## xmm4 = xmm4[0],xmm2[0],zero,zero
0000000000007c50	unpcklps	%xmm2, %xmm1                    ## xmm1 = xmm1[0],xmm2[0],xmm1[1],xmm2[1]
0000000000007c53	mulps	%xmm0, %xmm1
0000000000007c56	movaps	0x3c2583(%rip), %xmm0
0000000000007c5d	cmpltps	%xmm4, %xmm0
0000000000007c61	addps	0x3c2588(%rip), %xmm4
0000000000007c68	divps	0x3c2591(%rip), %xmm4
0000000000007c6f	blendvps	%xmm0, %xmm1, %xmm4
0000000000007c74	mulss	0x3c2630(%rip), %xmm5
0000000000007c7c	mulps	0x3c258d(%rip), %xmm4
0000000000007c83	xorps	%xmm0, %xmm0
0000000000007c86	blendps	$0xe, %xmm0, %xmm5              ## xmm5 = xmm5[0],xmm0[1,2,3]
0000000000007c8c	shufps	$0x4c, %xmm4, %xmm5             ## xmm5 = xmm5[0,3],xmm4[0,1]
0000000000007c90	shufps	$0x78, %xmm5, %xmm5             ## xmm5 = xmm5[0,2,3,1]
0000000000007c94	divps	0x3c2585(%rip), %xmm5
0000000000007c9b	movaps	%xmm5, %xmm0
0000000000007c9e	mulps	0x3c258b(%rip), %xmm0
0000000000007ca5	movaps	%xmm0, %xmm1
0000000000007ca8	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000007cac	addps	%xmm0, %xmm1
0000000000007caf	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
0000000000007cb3	addss	%xmm1, %xmm0
0000000000007cb7	movaps	%xmm5, %xmm1
0000000000007cba	mulps	0x3c257f(%rip), %xmm1
0000000000007cc1	mulps	0x3c2588(%rip), %xmm5
0000000000007cc8	ucomiss	0x3c25e1(%rip), %xmm0
0000000000007ccf	movaps	%xmm5, -0x40(%rbp)
0000000000007cd3	jbe	0x7d10
0000000000007cd5	movaps	%xmm1, -0xa0(%rbp)
0000000000007cdc	movss	0x3c25d0(%rip), %xmm1
0000000000007ce4	callq	0x3c54f2                        ## symbol stub for: _powf
0000000000007ce9	movaps	-0xa0(%rbp), %xmm1
0000000000007cf0	mulss	0x3c257c(%rip), %xmm0
0000000000007cf8	addss	0x3c25b8(%rip), %xmm0
0000000000007d00	jmp	0x7d18
0000000000007d02	nopw	%cs:(%rax,%rax)
0000000000007d10	mulss	0x3c2554(%rip), %xmm0
0000000000007d18	movaps	%xmm0, -0x50(%rbp)
0000000000007d1c	movaps	%xmm1, %xmm0
0000000000007d1f	unpckhpd	%xmm1, %xmm0                    ## xmm0 = xmm0[1],xmm1[1]
0000000000007d23	addps	%xmm1, %xmm0
0000000000007d26	movshdup	%xmm0, %xmm3                    ## xmm3 = xmm0[1,1,3,3]
0000000000007d2a	addss	%xmm0, %xmm3
0000000000007d2e	ucomiss	0x3c257b(%rip), %xmm3
0000000000007d35	jbe	0x7d60
0000000000007d37	movaps	%xmm3, %xmm0
0000000000007d3a	movss	0x3c2572(%rip), %xmm1
0000000000007d42	callq	0x3c54f2                        ## symbol stub for: _powf
0000000000007d47	movaps	%xmm0, %xmm3
0000000000007d4a	mulss	0x3c2522(%rip), %xmm3
0000000000007d52	addss	0x3c255e(%rip), %xmm3
0000000000007d5a	jmp	0x7d68
0000000000007d5c	nopl	(%rax)
0000000000007d60	mulss	0x3c2504(%rip), %xmm3
0000000000007d68	movaps	-0x40(%rbp), %xmm0
0000000000007d6c	movaps	%xmm0, %xmm1
0000000000007d6f	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000007d73	addps	%xmm0, %xmm1
0000000000007d76	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
0000000000007d7a	addss	%xmm1, %xmm0
0000000000007d7e	ucomiss	0x3c252b(%rip), %xmm0
0000000000007d85	ja	0x77b0
0000000000007d8b	mulss	0x3c24d9(%rip), %xmm0
0000000000007d93	jmp	0x77d5
0000000000007d98	xorl	%eax, %eax
0000000000007d9a	addq	$0xa8, %rsp
0000000000007da1	popq	%rbx
0000000000007da2	popq	%r12
0000000000007da4	popq	%r13
0000000000007da6	popq	%r14
0000000000007da8	popq	%r15
0000000000007daa	popq	%rbp
0000000000007dab	retq
0000000000007dac	nopl	(%rax)
