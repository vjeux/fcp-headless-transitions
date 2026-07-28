__ZN39HgcAVASpatialAverageAdaptive_LowerField10RenderTileEP6HGTile:
000000000021e470	pushq	%rbp
000000000021e471	movq	%rsp, %rbp
000000000021e474	pushq	%r15
000000000021e476	pushq	%r14
000000000021e478	pushq	%r13
000000000021e47a	pushq	%r12
000000000021e47c	pushq	%rbx
000000000021e47d	subq	$0x68, %rsp
000000000021e481	movq	%rsi, %rbx
000000000021e484	movq	%rdi, %r14
000000000021e487	movq	%rsi, %rdi
000000000021e48a	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
000000000021e48f	movq	%rax, %rdi
000000000021e492	xorl	%esi, %esi
000000000021e494	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000021e499	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000021e49e	jb	0x21e4bc
000000000021e4a0	movq	%r14, %rdi
000000000021e4a3	movq	%rbx, %rsi
000000000021e4a6	callq	__ZN39HgcAVASpatialAverageAdaptive_LowerField14RenderTile_AVXEP6HGTile ## HgcAVASpatialAverageAdaptive_LowerField::RenderTile_AVX(HGTile*)
000000000021e4ab	xorl	%eax, %eax
000000000021e4ad	addq	$0x68, %rsp
000000000021e4b1	popq	%rbx
000000000021e4b2	popq	%r12
000000000021e4b4	popq	%r13
000000000021e4b6	popq	%r14
000000000021e4b8	popq	%r15
000000000021e4ba	popq	%rbp
000000000021e4bb	retq
000000000021e4bc	movaps	(%rbx), %xmm0
000000000021e4bf	cvtdq2ps	%xmm0, %xmm1
000000000021e4c2	mulps	0x1abbe7(%rip), %xmm1
000000000021e4c9	addps	0x1abbf0(%rip), %xmm1
000000000021e4d0	movaps	%xmm1, -0x60(%rbp)
000000000021e4d4	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
000000000021e4d9	psubd	%xmm0, %xmm1
000000000021e4dd	pextrd	$0x1, %xmm1, %r9d
000000000021e4e4	movd	%xmm1, %r8d
000000000021e4e9	movslq	0x68(%rbx), %r10
000000000021e4ed	movq	0x60(%rbx), %rdx
000000000021e4f1	movslq	0x58(%rbx), %rcx
000000000021e4f5	movq	0x50(%rbx), %rsi
000000000021e4f9	movq	0x10(%rbx), %rdi
000000000021e4fd	movslq	0x18(%rbx), %r11
000000000021e501	movq	%r11, -0x30(%rbp)
000000000021e505	cmpl	$0x44fffff, %eax                ## imm = 0x44FFFFF
000000000021e50a	movq	%r14, -0x50(%rbp)
000000000021e50e	jbe	0x21e9c5
000000000021e514	testl	%r9d, %r9d
000000000021e517	jle	0x21e4ab
000000000021e519	testl	%r8d, %r8d
000000000021e51c	jle	0x21e4ab
000000000021e51e	movl	%r9d, %eax
000000000021e521	movq	%rax, -0x70(%rbp)
000000000021e525	movl	%r8d, %r9d
000000000021e528	movq	%rcx, %rax
000000000021e52b	shlq	$0x4, %rax
000000000021e52f	leaq	(%rsi,%rax), %r11
000000000021e533	shlq	$0x5, %rcx
000000000021e537	movq	%rsi, %r15
000000000021e53a	subq	%rcx, %r15
000000000021e53d	movq	%rsi, %r12
000000000021e540	movq	%rax, -0x38(%rbp)
000000000021e544	subq	%rax, %r12
000000000021e547	shlq	$0x4, %r10
000000000021e54b	shlq	$0x4, -0x30(%rbp)
000000000021e550	movq	%rdx, %r8
000000000021e553	movq	%r10, -0x40(%rbp)
000000000021e557	subq	%r10, %r8
000000000021e55a	shlq	$0x4, %r9
000000000021e55e	xorl	%eax, %eax
000000000021e560	movaps	0x1a9708(%rip), %xmm14
000000000021e568	movss	0x1a9750(%rip), %xmm4
000000000021e570	movaps	-0x60(%rbp), %xmm8
000000000021e575	nopw	%cs:(%rax,%rax)
000000000021e580	incq	%rax
000000000021e583	movq	%rax, -0x48(%rbp)
000000000021e587	xorl	%ecx, %ecx
000000000021e589	movaps	%xmm8, -0x80(%rbp)
000000000021e58e	nop
000000000021e590	movaps	0x10(%r8,%rcx), %xmm0
000000000021e596	subps	-0x10(%rdx,%rcx), %xmm0
000000000021e59b	movaps	0x20(%r8,%rcx), %xmm12
000000000021e5a1	subps	-0x20(%rdx,%rcx), %xmm12
000000000021e5a7	insertps	$0x4c, %xmm0, %xmm12            ## xmm12 = xmm0[1],xmm12[1],zero,zero
000000000021e5ae	movaps	0x30(%r8,%rcx), %xmm0
000000000021e5b4	subps	-0x30(%rdx,%rcx), %xmm0
000000000021e5b9	shufps	$0xd4, %xmm0, %xmm12            ## xmm12 = xmm12[0,1],xmm0[1,3]
000000000021e5be	movaps	0x40(%r8,%rcx), %xmm0
000000000021e5c4	subps	-0x40(%rdx,%rcx), %xmm0
000000000021e5c9	insertps	$0x70, %xmm0, %xmm12            ## xmm12 = xmm12[0,1,2],xmm0[1]
000000000021e5d0	movq	0x198(%r14), %rax
000000000021e5d7	movaps	(%rax), %xmm0
000000000021e5da	movaps	0x20(%rax), %xmm1
000000000021e5de	movaps	0x40(%rax), %xmm11
000000000021e5e3	movaps	0x60(%rax), %xmm10
000000000021e5e8	andps	%xmm1, %xmm12
000000000021e5ec	movaps	-0x40(%r8,%rcx), %xmm2
000000000021e5f2	movaps	-0x30(%r8,%rcx), %xmm3
000000000021e5f8	movaps	-0x20(%r8,%rcx), %xmm13
000000000021e5fe	movaps	-0x10(%r8,%rcx), %xmm9
000000000021e604	subps	0x10(%rdx,%rcx), %xmm9
000000000021e60a	subps	0x20(%rdx,%rcx), %xmm13
000000000021e610	subps	0x30(%rdx,%rcx), %xmm3
000000000021e615	insertps	$0x4c, %xmm9, %xmm13            ## xmm13 = xmm9[1],xmm13[1],zero,zero
000000000021e61c	shufps	$0xd4, %xmm3, %xmm13            ## xmm13 = xmm13[0,1],xmm3[1,3]
000000000021e621	subps	0x40(%rdx,%rcx), %xmm2
000000000021e626	insertps	$0x70, %xmm2, %xmm13            ## xmm13 = xmm13[0,1,2],xmm2[1]
000000000021e62d	andps	%xmm1, %xmm13
000000000021e631	movaps	(%r8,%rcx), %xmm1
000000000021e636	movaps	(%rdx,%rcx), %xmm7
000000000021e63a	subps	%xmm7, %xmm1
000000000021e63d	shufps	$0x55, %xmm1, %xmm7             ## xmm7 = xmm7[1,1],xmm1[1,1]
000000000021e641	movaps	%xmm0, %xmm1
000000000021e644	shufps	$0x0, %xmm0, %xmm1              ## xmm1 = xmm1[0,0],xmm0[0,0]
000000000021e648	movaps	%xmm12, %xmm15
000000000021e64c	cmpltps	%xmm1, %xmm15
000000000021e651	andps	%xmm11, %xmm15
000000000021e655	movaps	%xmm15, %xmm2
000000000021e659	dpps	$0xff, %xmm11, %xmm2
000000000021e660	movaps	%xmm13, %xmm3
000000000021e664	cmpltps	%xmm1, %xmm3
000000000021e668	andps	%xmm11, %xmm3
000000000021e66c	movaps	%xmm3, %xmm1
000000000021e66f	dpps	$0xff, %xmm11, %xmm1
000000000021e676	movaps	%xmm14, %xmm5
000000000021e67a	movaps	0x120(%rax), %xmm14
000000000021e682	andps	%xmm14, %xmm7
000000000021e686	blendps	$0xd, %xmm2, %xmm1              ## xmm1 = xmm2[0],xmm1[1],xmm2[2,3]
000000000021e68c	movshdup	%xmm0, %xmm6                    ## xmm6 = xmm0[1,1,3,3]
000000000021e690	movaps	%xmm6, %xmm9
000000000021e694	subps	%xmm12, %xmm9
000000000021e698	shufps	$0x55, %xmm0, %xmm0             ## xmm0 = xmm0[1,1,1,1]
000000000021e69c	subps	%xmm7, %xmm0
000000000021e69f	blendps	$0xc, %xmm0, %xmm9              ## xmm9 = xmm9[0,1],xmm0[2,3]
000000000021e6a6	cmpltps	%xmm10, %xmm9
000000000021e6ab	andps	%xmm11, %xmm9
000000000021e6af	pshufd	$0x55, %xmm9, %xmm7             ## xmm7 = xmm9[1,1,1,1]
000000000021e6b5	movdqa	%xmm9, %xmm2
000000000021e6ba	pslldq	$0x8, %xmm2                     ## xmm2 = zero,zero,zero,zero,zero,zero,zero,zero,xmm2[0,1,2,3,4,5,6,7]
000000000021e6bf	minps	%xmm2, %xmm7
000000000021e6c2	blendps	$0x3, %xmm1, %xmm7              ## xmm7 = xmm1[0,1],xmm7[2,3]
000000000021e6c8	minps	%xmm7, %xmm9
000000000021e6cc	blendps	$0xc, %xmm9, %xmm1              ## xmm1 = xmm1[0,1],xmm9[2,3]
000000000021e6d3	subps	%xmm13, %xmm6
000000000021e6d7	blendps	$0xc, %xmm0, %xmm6              ## xmm6 = xmm6[0,1],xmm0[2,3]
000000000021e6dd	cmpltps	%xmm10, %xmm6
000000000021e6e2	andps	%xmm11, %xmm6
000000000021e6e6	movlhps	%xmm6, %xmm9                    ## xmm9 = xmm9[0],xmm6[0]
000000000021e6ea	pshufd	$0x0, %xmm6, %xmm0              ## xmm0 = xmm6[0,0,0,0]
000000000021e6ef	minps	%xmm0, %xmm9
000000000021e6f3	blendps	$0x7, %xmm1, %xmm9              ## xmm9 = xmm1[0,1,2],xmm9[3]
000000000021e6fa	pshufd	$0xa0, %xmm6, %xmm0             ## xmm0 = xmm6[0,0,2,2]
000000000021e6ff	minps	%xmm9, %xmm0
000000000021e703	blendps	$0x7, %xmm1, %xmm0              ## xmm0 = xmm1[0,1,2],xmm0[3]
000000000021e709	movaps	%xmm0, %xmm2
000000000021e70c	shufps	$0x1b, %xmm0, %xmm2             ## xmm2 = xmm2[3,2],xmm0[1,0]
000000000021e710	mulps	%xmm0, %xmm2
000000000021e713	cmpnleps	%xmm10, %xmm2
000000000021e718	andps	0x80(%rax), %xmm2
000000000021e71f	xorps	%xmm10, %xmm2
000000000021e723	movaps	%xmm8, %xmm9
000000000021e727	subps	0xa0(%rax), %xmm9
000000000021e72f	pshufd	$0x0, %xmm2, %xmm1              ## xmm1 = xmm2[0,0,0,0]
000000000021e734	pshufd	$0x55, %xmm2, %xmm0             ## xmm0 = xmm2[1,1,1,1]
000000000021e739	subps	%xmm0, %xmm1
000000000021e73c	movaps	%xmm10, %xmm2
000000000021e740	movaps	%xmm1, %xmm0
000000000021e743	blendvps	%xmm0, %xmm3, %xmm2
000000000021e748	movaps	%xmm1, %xmm3
000000000021e74b	cmpnleps	%xmm10, %xmm3
000000000021e750	movaps	%xmm3, %xmm0
000000000021e753	blendvps	%xmm0, %xmm15, %xmm2
000000000021e759	movaps	%xmm10, %xmm6
000000000021e75d	movaps	%xmm1, %xmm0
000000000021e760	blendvps	%xmm0, %xmm13, %xmm6
000000000021e766	movaps	%xmm3, %xmm0
000000000021e769	blendvps	%xmm0, %xmm12, %xmm6
000000000021e76f	movaps	0x100(%rax), %xmm3
000000000021e776	cmpnleps	%xmm10, %xmm2
000000000021e77b	movaps	%xmm2, %xmm0
000000000021e77e	blendvps	%xmm0, %xmm6, %xmm3
000000000021e783	movaps	%xmm3, %xmm0
000000000021e786	shufps	$0xf1, %xmm3, %xmm0             ## xmm0 = xmm0[1,0],xmm3[3,3]
000000000021e78a	minps	%xmm3, %xmm0
000000000021e78d	movaps	%xmm0, %xmm3
000000000021e790	shufps	$0xca, %xmm0, %xmm3             ## xmm3 = xmm3[2,2],xmm0[0,3]
000000000021e794	minps	%xmm0, %xmm3
000000000021e797	subps	%xmm6, %xmm3
000000000021e79a	movshdup	%xmm3, %xmm0                    ## xmm0 = xmm3[1,1,3,3]
000000000021e79e	movsldup	%xmm3, %xmm2                    ## xmm2 = xmm3[0,0,2,2]
000000000021e7a2	shufps	$0xaa, %xmm3, %xmm3             ## xmm3 = xmm3[2,2,2,2]
000000000021e7a6	cmpltps	%xmm10, %xmm3
000000000021e7ab	andps	%xmm14, %xmm3
000000000021e7af	movaps	%xmm5, %xmm14
000000000021e7b3	xorps	0x140(%rax), %xmm3
000000000021e7ba	movaps	0x160(%rax), %xmm6
000000000021e7c1	cmpltps	%xmm10, %xmm0
000000000021e7c6	blendvps	%xmm0, %xmm3, %xmm6
000000000021e7cb	movaps	0x180(%rax), %xmm3
000000000021e7d2	cmpltps	%xmm10, %xmm2
000000000021e7d7	movaps	%xmm2, %xmm0
000000000021e7da	blendvps	%xmm0, %xmm6, %xmm3
000000000021e7df	mulss	%xmm1, %xmm3
000000000021e7e3	addps	%xmm3, %xmm9
000000000021e7e7	movl	0x58(%rbx), %r13d
000000000021e7eb	movaps	-0x60(%rbp), %xmm5
000000000021e7ef	subps	%xmm5, %xmm9
000000000021e7f3	addps	%xmm14, %xmm9
000000000021e7f7	roundps	$0x1, %xmm9, %xmm0
000000000021e7fe	cvtps2dq	%xmm0, %xmm0
000000000021e802	movd	%xmm0, %r14d
000000000021e807	pextrd	$0x1, %xmm0, %r10d
000000000021e80e	imull	%r13d, %r10d
000000000021e812	addl	%r14d, %r10d
000000000021e815	movq	0x50(%rbx), %r14
000000000021e819	movslq	%r10d, %r10
000000000021e81c	shlq	$0x4, %r10
000000000021e820	movaps	(%r14,%r10), %xmm2
000000000021e825	movaps	%xmm8, %xmm0
000000000021e829	subps	%xmm3, %xmm0
000000000021e82c	subps	%xmm5, %xmm0
000000000021e82f	addps	%xmm14, %xmm0
000000000021e833	roundps	$0x1, %xmm0, %xmm0
000000000021e839	cvtps2dq	%xmm0, %xmm0
000000000021e83d	extractps	$0x1, %xmm0, %r10d
000000000021e844	imull	%r13d, %r10d
000000000021e848	movd	%xmm0, %r13d
000000000021e84d	addl	%r13d, %r10d
000000000021e850	movslq	%r10d, %r10
000000000021e853	shlq	$0x4, %r10
000000000021e857	addps	(%r14,%r10), %xmm2
000000000021e85c	movq	-0x50(%rbp), %r14
000000000021e860	movaps	(%r12,%rcx), %xmm3
000000000021e865	movaps	(%rsi,%rcx), %xmm9
000000000021e86a	mulps	0x1a0(%rax), %xmm2
000000000021e871	movaps	%xmm3, %xmm6
000000000021e874	minss	%xmm9, %xmm6
000000000021e879	movaps	%xmm2, %xmm7
000000000021e87c	minss	%xmm3, %xmm7
000000000021e880	movaps	%xmm6, %xmm0
000000000021e883	unpcklps	%xmm7, %xmm0                    ## xmm0 = xmm0[0],xmm7[0],xmm0[1],xmm7[1]
000000000021e886	movaps	%xmm2, %xmm12
000000000021e88a	minss	%xmm9, %xmm12
000000000021e88f	movlhps	%xmm12, %xmm0                   ## xmm0 = xmm0[0],xmm12[0]
000000000021e893	shufps	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
000000000021e897	movaps	%xmm0, %xmm12
000000000021e89b	cmpleps	%xmm6, %xmm12
000000000021e8a0	andps	%xmm11, %xmm12
000000000021e8a4	shufps	$0x0, %xmm7, %xmm7              ## xmm7 = xmm7[0,0,0,0]
000000000021e8a8	movaps	%xmm0, %xmm6
000000000021e8ab	cmpleps	%xmm7, %xmm6
000000000021e8af	andps	%xmm11, %xmm6
000000000021e8b3	pshufd	$0xaa, %xmm12, %xmm7            ## xmm7 = xmm12[2,2,2,2]
000000000021e8b9	pshufd	$0x55, %xmm12, %xmm12           ## xmm12 = xmm12[1,1,1,1]
000000000021e8bf	minps	%xmm12, %xmm7
000000000021e8c3	pshufd	$0xaa, %xmm6, %xmm12            ## xmm12 = xmm6[2,2,2,2]
000000000021e8c9	pshufd	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
000000000021e8ce	minps	%xmm6, %xmm12
000000000021e8d2	movaps	%xmm10, %xmm6
000000000021e8d6	subps	%xmm12, %xmm6
000000000021e8da	mulps	%xmm7, %xmm6
000000000021e8dd	addps	%xmm12, %xmm6
000000000021e8e1	movaps	%xmm7, %xmm12
000000000021e8e5	maxps	%xmm6, %xmm12
000000000021e8e9	movaps	%xmm11, %xmm13
000000000021e8ed	subps	%xmm12, %xmm13
000000000021e8f1	unpcklps	%xmm7, %xmm6                    ## xmm6 = xmm6[0],xmm7[0],xmm6[1],xmm7[1]
000000000021e8f4	shufps	$0xe9, %xmm13, %xmm6            ## xmm6 = xmm6[1,2],xmm13[2,3]
000000000021e8f9	dpps	$0x7f, %xmm0, %xmm6
000000000021e8ff	movaps	%xmm3, %xmm0
000000000021e902	subss	%xmm6, %xmm0
000000000021e906	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000021e90a	cmpeqps	%xmm10, %xmm0
000000000021e90f	andps	%xmm11, %xmm0
000000000021e913	cmpnleps	%xmm10, %xmm0
000000000021e918	blendvps	%xmm0, %xmm3, %xmm2
000000000021e91d	movaps	%xmm9, %xmm0
000000000021e921	subss	%xmm6, %xmm0
000000000021e925	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000021e929	cmpeqps	%xmm10, %xmm0
000000000021e92e	andps	%xmm11, %xmm0
000000000021e932	cmpnleps	%xmm10, %xmm0
000000000021e937	blendvps	%xmm0, %xmm9, %xmm2
000000000021e93d	addps	%xmm9, %xmm3
000000000021e941	mulps	0xc0(%rax), %xmm3
000000000021e948	movaps	(%r15,%rcx), %xmm6
000000000021e94d	addps	(%r11,%rcx), %xmm6
000000000021e952	mulps	0xe0(%rax), %xmm6
000000000021e959	addps	%xmm3, %xmm6
000000000021e95c	cmpeqps	%xmm10, %xmm1
000000000021e961	andps	%xmm11, %xmm1
000000000021e965	cmpnleps	%xmm10, %xmm1
000000000021e96a	movaps	%xmm1, %xmm0
000000000021e96d	blendvps	%xmm0, %xmm6, %xmm2
000000000021e972	movaps	%xmm2, (%rdi,%rcx)
000000000021e976	addps	%xmm4, %xmm8
000000000021e97a	addq	$0x10, %rcx
000000000021e97e	cmpq	%rcx, %r9
000000000021e981	jne	0x21e590
000000000021e987	movaps	-0x80(%rbp), %xmm8
000000000021e98c	addps	0x1a931c(%rip), %xmm8
000000000021e994	movq	-0x38(%rbp), %rax
000000000021e998	addq	%rax, %r11
000000000021e99b	addq	%rax, %r15
000000000021e99e	addq	%rax, %rsi
000000000021e9a1	addq	%rax, %r12
000000000021e9a4	movq	-0x40(%rbp), %rax
000000000021e9a8	addq	%rax, %rdx
000000000021e9ab	addq	-0x30(%rbp), %rdi
000000000021e9af	addq	%rax, %r8
000000000021e9b2	movq	-0x48(%rbp), %rax
000000000021e9b6	cmpq	-0x70(%rbp), %rax
000000000021e9ba	jne	0x21e580
000000000021e9c0	jmp	0x21e4ab
000000000021e9c5	testl	%r9d, %r9d
000000000021e9c8	jle	0x21e4ab
000000000021e9ce	testl	%r8d, %r8d
000000000021e9d1	jle	0x21e4ab
000000000021e9d7	movl	%r9d, %eax
000000000021e9da	movq	%rax, -0x38(%rbp)
000000000021e9de	movl	%r8d, %r9d
000000000021e9e1	movq	%rcx, %rax
000000000021e9e4	shlq	$0x4, %rax
000000000021e9e8	leaq	(%rsi,%rax), %r11
000000000021e9ec	shlq	$0x5, %rcx
000000000021e9f0	movq	%rsi, %r15
000000000021e9f3	subq	%rcx, %r15
000000000021e9f6	movq	%rsi, %r12
000000000021e9f9	movq	%rax, -0x88(%rbp)
000000000021ea00	subq	%rax, %r12
000000000021ea03	shlq	$0x4, %r10
000000000021ea07	shlq	$0x4, -0x30(%rbp)
000000000021ea0c	movq	%rdx, %r13
000000000021ea0f	movq	%r10, -0x40(%rbp)
000000000021ea13	subq	%r10, %r13
000000000021ea16	shlq	$0x4, %r9
000000000021ea1a	xorl	%eax, %eax
000000000021ea1c	movaps	0x1a924c(%rip), %xmm14
000000000021ea24	movaps	-0x60(%rbp), %xmm10
000000000021ea29	nopl	(%rax)
000000000021ea30	incq	%rax
000000000021ea33	movq	%rax, -0x80(%rbp)
000000000021ea37	xorl	%r8d, %r8d
000000000021ea3a	movaps	%xmm10, -0x70(%rbp)
000000000021ea3f	nop
000000000021ea40	movaps	0x10(%r13,%r8), %xmm3
000000000021ea46	subps	-0x10(%rdx,%r8), %xmm3
000000000021ea4c	movaps	0x20(%r13,%r8), %xmm2
000000000021ea52	subps	-0x20(%rdx,%r8), %xmm2
000000000021ea58	movaps	0x30(%r13,%r8), %xmm4
000000000021ea5e	subps	-0x30(%rdx,%r8), %xmm4
000000000021ea64	movaps	0x40(%r13,%r8), %xmm7
000000000021ea6a	subps	-0x40(%rdx,%r8), %xmm7
000000000021ea70	movq	0x198(%r14), %rax
000000000021ea77	movapd	0x1c0(%rax), %xmm0
000000000021ea7f	movaps	(%rax), %xmm1
000000000021ea82	insertps	$0x4c, %xmm3, %xmm2             ## xmm2 = xmm3[1],xmm2[1],zero,zero
000000000021ea88	movapd	0x20(%rax), %xmm3
000000000021ea8d	movaps	0x40(%rax), %xmm12
000000000021ea92	movaps	0x60(%rax), %xmm11
000000000021ea97	movddup	%xmm7, %xmm7                    ## xmm7 = xmm7[0,0]
000000000021ea9b	movaps	-0x40(%r13,%r8), %xmm8
000000000021eaa1	movaps	-0x30(%r13,%r8), %xmm9
000000000021eaa7	movaps	%xmm14, %xmm5
000000000021eaab	movaps	-0x20(%r13,%r8), %xmm14
000000000021eab1	shufps	$0xd4, %xmm4, %xmm2             ## xmm2 = xmm2[0,1],xmm4[1,3]
000000000021eab5	movaps	-0x10(%r13,%r8), %xmm4
000000000021eabb	subps	0x10(%rdx,%r8), %xmm4
000000000021eac1	andpd	%xmm0, %xmm7
000000000021eac5	subps	0x20(%rdx,%r8), %xmm14
000000000021eacb	insertps	$0x4c, %xmm4, %xmm14            ## xmm14 = xmm4[1],xmm14[1],zero,zero
000000000021ead2	movapd	%xmm0, %xmm13
000000000021ead7	subps	0x30(%rdx,%r8), %xmm9
000000000021eadd	shufps	$0xd4, %xmm9, %xmm14            ## xmm14 = xmm14[0,1],xmm9[1,3]
000000000021eae2	andnpd	%xmm2, %xmm13
000000000021eae7	subps	0x40(%rdx,%r8), %xmm8
000000000021eaed	movddup	%xmm8, %xmm2                    ## xmm2 = xmm8[0,0]
000000000021eaf2	orpd	%xmm7, %xmm13
000000000021eaf7	andpd	%xmm0, %xmm2
000000000021eafb	movapd	%xmm0, %xmm15
000000000021eb00	andnpd	%xmm14, %xmm15
000000000021eb05	orpd	%xmm2, %xmm15
000000000021eb0a	movaps	(%r13,%r8), %xmm2
000000000021eb10	movaps	(%rdx,%r8), %xmm7
000000000021eb15	subps	%xmm7, %xmm2
000000000021eb18	andpd	%xmm3, %xmm13
000000000021eb1d	shufps	$0x55, %xmm2, %xmm7             ## xmm7 = xmm7[1,1],xmm2[1,1]
000000000021eb21	movaps	0x120(%rax), %xmm14
000000000021eb29	andps	%xmm14, %xmm7
000000000021eb2d	andpd	%xmm3, %xmm15
000000000021eb32	movaps	%xmm1, %xmm3
000000000021eb35	shufps	$0x0, %xmm1, %xmm3              ## xmm3 = xmm3[0,0],xmm1[0,0]
000000000021eb39	movapd	%xmm13, %xmm2
000000000021eb3e	cmpltps	%xmm3, %xmm2
000000000021eb42	andps	%xmm12, %xmm2
000000000021eb46	pshufd	$0xf5, %xmm2, %xmm8             ## xmm8 = xmm2[1,1,3,3]
000000000021eb4c	movapd	%xmm15, %xmm4
000000000021eb51	addps	%xmm2, %xmm8
000000000021eb55	cmpltps	%xmm3, %xmm4
000000000021eb59	andps	%xmm12, %xmm4
000000000021eb5d	pshufd	$0x39, %xmm4, %xmm3             ## xmm3 = xmm4[1,2,3,0]
000000000021eb62	addps	%xmm4, %xmm3
000000000021eb65	movaps	%xmm3, %xmm6
000000000021eb68	blendps	$0x7, %xmm8, %xmm3              ## xmm3 = xmm8[0,1,2],xmm3[3]
000000000021eb6f	movshdup	%xmm1, %xmm9                    ## xmm9 = xmm1[1,1,3,3]
000000000021eb74	blendps	$0x1, %xmm8, %xmm6              ## xmm6 = xmm8[0],xmm6[1,2,3]
000000000021eb7b	movaps	%xmm9, %xmm8
000000000021eb7f	subps	%xmm13, %xmm8
000000000021eb83	shufps	$0x55, %xmm1, %xmm1             ## xmm1 = xmm1[1,1,1,1]
000000000021eb87	movhlps	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
000000000021eb8a	subps	%xmm7, %xmm1
000000000021eb8d	blendps	$0xc, %xmm1, %xmm8              ## xmm8 = xmm8[0,1],xmm1[2,3]
000000000021eb94	cmpltps	%xmm11, %xmm8
000000000021eb99	addps	%xmm6, %xmm3
000000000021eb9c	andps	%xmm12, %xmm8
000000000021eba0	pshufd	$0x55, %xmm8, %xmm6             ## xmm6 = xmm8[1,1,1,1]
000000000021eba6	movdqa	%xmm8, %xmm7
000000000021ebab	pslldq	$0x8, %xmm7                     ## xmm7 = zero,zero,zero,zero,zero,zero,zero,zero,xmm7[0,1,2,3,4,5,6,7]
000000000021ebb0	minps	%xmm7, %xmm6
000000000021ebb3	blendps	$0x3, %xmm3, %xmm6              ## xmm6 = xmm3[0,1],xmm6[2,3]
000000000021ebb9	minps	%xmm6, %xmm8
000000000021ebbd	subps	%xmm15, %xmm9
000000000021ebc1	blendps	$0xc, %xmm1, %xmm9              ## xmm9 = xmm9[0,1],xmm1[2,3]
000000000021ebc8	cmpltps	%xmm11, %xmm9
000000000021ebcd	andps	%xmm12, %xmm9
000000000021ebd1	blendps	$0xc, %xmm8, %xmm3              ## xmm3 = xmm3[0,1],xmm8[2,3]
000000000021ebd8	movlhps	%xmm9, %xmm8                    ## xmm8 = xmm8[0],xmm9[0]
000000000021ebdc	pshufd	$0x0, %xmm9, %xmm1              ## xmm1 = xmm9[0,0,0,0]
000000000021ebe2	minps	%xmm1, %xmm8
000000000021ebe6	movapd	%xmm0, %xmm1
000000000021ebea	andnpd	%xmm3, %xmm1
000000000021ebee	andps	%xmm0, %xmm8
000000000021ebf2	pshufd	$0xa0, %xmm9, %xmm3             ## xmm3 = xmm9[0,0,2,2]
000000000021ebf8	orps	%xmm1, %xmm8
000000000021ebfc	minps	%xmm8, %xmm3
000000000021ec00	andps	%xmm0, %xmm3
000000000021ec03	orps	%xmm1, %xmm3
000000000021ec06	pshufd	$0x1b, %xmm3, %xmm0             ## xmm0 = xmm3[3,2,1,0]
000000000021ec0b	mulps	%xmm3, %xmm0
000000000021ec0e	cmpnleps	%xmm11, %xmm0
000000000021ec13	andps	0x80(%rax), %xmm0
000000000021ec1a	xorps	%xmm11, %xmm0
000000000021ec1e	pshufd	$0x0, %xmm0, %xmm1              ## xmm1 = xmm0[0,0,0,0]
000000000021ec23	pshufd	$0x55, %xmm0, %xmm0             ## xmm0 = xmm0[1,1,1,1]
000000000021ec28	subps	%xmm0, %xmm1
000000000021ec2b	movaps	%xmm1, %xmm3
000000000021ec2e	cmpltps	%xmm11, %xmm3
000000000021ec33	movaps	%xmm11, %xmm6
000000000021ec37	movaps	%xmm3, %xmm0
000000000021ec3a	blendvps	%xmm0, %xmm4, %xmm6
000000000021ec3f	movaps	%xmm1, %xmm4
000000000021ec42	cmpleps	%xmm11, %xmm4
000000000021ec47	movaps	%xmm4, %xmm0
000000000021ec4a	blendvps	%xmm0, %xmm6, %xmm2
000000000021ec4f	movaps	%xmm11, %xmm6
000000000021ec53	movaps	%xmm3, %xmm0
000000000021ec56	blendvps	%xmm0, %xmm15, %xmm6
000000000021ec5c	movaps	%xmm4, %xmm0
000000000021ec5f	blendvps	%xmm0, %xmm6, %xmm13
000000000021ec65	cmpleps	%xmm11, %xmm2
000000000021ec6a	movaps	%xmm13, %xmm3
000000000021ec6e	movaps	%xmm2, %xmm0
000000000021ec71	blendvps	%xmm0, 0x100(%rax), %xmm3
000000000021ec7a	pshufd	$0xf1, %xmm3, %xmm0             ## xmm0 = xmm3[1,0,3,3]
000000000021ec7f	minps	%xmm3, %xmm0
000000000021ec82	movaps	%xmm0, %xmm3
000000000021ec85	shufps	$0xca, %xmm0, %xmm3             ## xmm3 = xmm3[2,2],xmm0[0,3]
000000000021ec89	minps	%xmm0, %xmm3
000000000021ec8c	subps	%xmm13, %xmm3
000000000021ec90	movshdup	%xmm3, %xmm0                    ## xmm0 = xmm3[1,1,3,3]
000000000021ec94	movsldup	%xmm3, %xmm2                    ## xmm2 = xmm3[0,0,2,2]
000000000021ec98	shufps	$0xaa, %xmm3, %xmm3             ## xmm3 = xmm3[2,2,2,2]
000000000021ec9c	cmpltps	%xmm11, %xmm3
000000000021eca1	andps	%xmm14, %xmm3
000000000021eca5	movaps	%xmm5, %xmm14
000000000021eca9	movaps	-0x60(%rbp), %xmm5
000000000021ecad	cmpnltps	%xmm11, %xmm0
000000000021ecb2	cmpnltps	%xmm11, %xmm2
000000000021ecb7	movq	%rax, -0x48(%rbp)
000000000021ecbb	xorps	0x140(%rax), %xmm3
000000000021ecc2	blendvps	%xmm0, 0x160(%rax), %xmm3
000000000021eccb	movaps	%xmm2, %xmm0
000000000021ecce	blendvps	%xmm0, 0x180(%rax), %xmm3
000000000021ecd7	movaps	%xmm10, %xmm0
000000000021ecdb	subps	0xa0(%rax), %xmm0
000000000021ece2	mulss	%xmm1, %xmm3
000000000021ece6	movl	0x58(%rbx), %eax
000000000021ece9	addps	%xmm3, %xmm0
000000000021ecec	subps	%xmm5, %xmm0
000000000021ecef	addps	%xmm14, %xmm0
000000000021ecf3	cvtps2dq	%xmm0, %xmm2
000000000021ecf7	cvtdq2ps	%xmm2, %xmm4
000000000021ecfa	cmpltps	%xmm4, %xmm0
000000000021ecfe	movaps	%xmm10, %xmm4
000000000021ed02	subps	%xmm3, %xmm4
000000000021ed05	paddd	%xmm2, %xmm0
000000000021ed09	subps	%xmm5, %xmm4
000000000021ed0c	addps	%xmm14, %xmm4
000000000021ed10	cvtps2dq	%xmm4, %xmm2
000000000021ed14	movd	%xmm0, %r10d
000000000021ed19	cvtdq2ps	%xmm2, %xmm3
000000000021ed1c	cmpltps	%xmm3, %xmm4
000000000021ed20	movq	%rsi, %rcx
000000000021ed23	movq	%rdi, %rsi
000000000021ed26	movq	%r12, %rdi
000000000021ed29	movq	%r15, %r12
000000000021ed2c	movq	%r11, %r15
000000000021ed2f	movq	%r9, %r11
000000000021ed32	pextrd	$0x1, %xmm0, %r9d
000000000021ed39	paddd	%xmm2, %xmm4
000000000021ed3d	pextrd	$0x1, %xmm4, %r14d
000000000021ed44	imull	%eax, %r9d
000000000021ed48	addl	%r10d, %r9d
000000000021ed4b	imull	%eax, %r14d
000000000021ed4f	movd	%xmm4, %eax
000000000021ed53	addl	%eax, %r14d
000000000021ed56	movq	0x50(%rbx), %rax
000000000021ed5a	movslq	%r9d, %r9
000000000021ed5d	shlq	$0x4, %r9
000000000021ed61	movaps	(%rax,%r9), %xmm4
000000000021ed66	movslq	%r14d, %r9
000000000021ed69	movq	-0x50(%rbp), %r14
000000000021ed6d	shlq	$0x4, %r9
000000000021ed71	addps	(%rax,%r9), %xmm4
000000000021ed76	movq	%r11, %r9
000000000021ed79	movq	%r15, %r11
000000000021ed7c	movq	%r12, %r15
000000000021ed7f	movq	%rdi, %r12
000000000021ed82	movq	%rsi, %rdi
000000000021ed85	movq	%rcx, %rsi
000000000021ed88	movaps	(%r12,%r8), %xmm3
000000000021ed8d	movq	-0x48(%rbp), %rax
000000000021ed91	mulps	0x1a0(%rax), %xmm4
000000000021ed98	movaps	(%rcx,%r8), %xmm2
000000000021ed9d	movaps	%xmm3, %xmm6
000000000021eda0	minss	%xmm2, %xmm6
000000000021eda4	movaps	%xmm4, %xmm7
000000000021eda7	minss	%xmm3, %xmm7
000000000021edab	movaps	%xmm6, %xmm0
000000000021edae	movaps	%xmm4, %xmm8
000000000021edb2	minss	%xmm2, %xmm8
000000000021edb7	unpcklps	%xmm7, %xmm0                    ## xmm0 = xmm0[0],xmm7[0],xmm0[1],xmm7[1]
000000000021edba	movlhps	%xmm8, %xmm0                    ## xmm0 = xmm0[0],xmm8[0]
000000000021edbe	shufps	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
000000000021edc2	movaps	%xmm0, %xmm8
000000000021edc6	cmpleps	%xmm6, %xmm8
000000000021edcb	shufps	$0x0, %xmm7, %xmm7              ## xmm7 = xmm7[0,0,0,0]
000000000021edcf	movaps	%xmm0, %xmm6
000000000021edd2	cmpleps	%xmm7, %xmm6
000000000021edd6	andps	%xmm12, %xmm8
000000000021edda	andps	%xmm12, %xmm6
000000000021edde	pshufd	$0xaa, %xmm8, %xmm7             ## xmm7 = xmm8[2,2,2,2]
000000000021ede4	pshufd	$0x55, %xmm8, %xmm9             ## xmm9 = xmm8[1,1,1,1]
000000000021edea	pshufd	$0xaa, %xmm6, %xmm13            ## xmm13 = xmm6[2,2,2,2]
000000000021edf0	pshufd	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
000000000021edf5	minps	%xmm6, %xmm13
000000000021edf9	movaps	%xmm11, %xmm8
000000000021edfd	minps	%xmm9, %xmm7
000000000021ee01	subps	%xmm13, %xmm8
000000000021ee05	mulps	%xmm7, %xmm8
000000000021ee09	addps	%xmm13, %xmm8
000000000021ee0d	movaps	%xmm7, %xmm6
000000000021ee10	maxps	%xmm8, %xmm6
000000000021ee14	movaps	%xmm12, %xmm9
000000000021ee18	subps	%xmm6, %xmm9
000000000021ee1c	unpcklps	%xmm7, %xmm8                    ## xmm8 = xmm8[0],xmm7[0],xmm8[1],xmm7[1]
000000000021ee20	shufps	$0xa9, %xmm9, %xmm8             ## xmm8 = xmm8[1,2],xmm9[2,2]
000000000021ee25	mulps	%xmm0, %xmm8
000000000021ee29	movshdup	%xmm8, %xmm0                    ## xmm0 = xmm8[1,1,3,3]
000000000021ee2e	movaps	%xmm3, %xmm7
000000000021ee31	addss	%xmm8, %xmm0
000000000021ee36	movhlps	%xmm8, %xmm8                    ## xmm8 = xmm8[1,1]
000000000021ee3a	addss	%xmm0, %xmm8
000000000021ee3f	movaps	%xmm3, %xmm0
000000000021ee42	subss	%xmm8, %xmm0
000000000021ee47	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000021ee4b	cmpeqps	%xmm11, %xmm0
000000000021ee50	andps	%xmm12, %xmm0
000000000021ee54	cmpleps	%xmm11, %xmm0
000000000021ee59	blendvps	%xmm0, %xmm4, %xmm3
000000000021ee5e	movaps	%xmm2, %xmm0
000000000021ee61	subss	%xmm8, %xmm0
000000000021ee66	addps	%xmm2, %xmm7
000000000021ee69	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000021ee6d	cmpeqps	%xmm11, %xmm0
000000000021ee72	andps	%xmm12, %xmm0
000000000021ee76	cmpleps	%xmm11, %xmm0
000000000021ee7b	blendvps	%xmm0, %xmm3, %xmm2
000000000021ee80	mulps	0xc0(%rax), %xmm7
000000000021ee87	movaps	(%r15,%r8), %xmm3
000000000021ee8c	addps	(%r11,%r8), %xmm3
000000000021ee91	cmpeqps	%xmm11, %xmm1
000000000021ee96	andps	%xmm12, %xmm1
000000000021ee9a	mulps	0xe0(%rax), %xmm3
000000000021eea1	addps	%xmm7, %xmm3
000000000021eea4	cmpleps	%xmm11, %xmm1
000000000021eea9	movaps	%xmm1, %xmm0
000000000021eeac	blendvps	%xmm0, %xmm2, %xmm3
000000000021eeb1	movss	0x1a8e07(%rip), %xmm0
000000000021eeb9	movaps	%xmm3, (%rdi,%r8)
000000000021eebe	addps	%xmm0, %xmm10
000000000021eec2	addq	$0x10, %r8
000000000021eec6	cmpq	%r8, %r9
000000000021eec9	jne	0x21ea40
000000000021eecf	movaps	-0x70(%rbp), %xmm10
000000000021eed4	addps	0x1a8dd4(%rip), %xmm10
000000000021eedc	movq	-0x88(%rbp), %rax
000000000021eee3	addq	%rax, %r11
000000000021eee6	addq	%rax, %r15
000000000021eee9	addq	%rax, %rsi
000000000021eeec	addq	%rax, %r12
000000000021eeef	movq	-0x40(%rbp), %rax
000000000021eef3	addq	%rax, %rdx
000000000021eef6	addq	-0x30(%rbp), %rdi
000000000021eefa	addq	%rax, %r13
000000000021eefd	movq	-0x80(%rbp), %rax
000000000021ef01	cmpq	-0x38(%rbp), %rax
000000000021ef05	jne	0x21ea30
000000000021ef0b	jmp	0x21e4ab
