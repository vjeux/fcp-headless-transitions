__ZN18HGComicColorStroke10RenderTileEP6HGTile:
00000000001bc310	pushq	%rbp
00000000001bc311	movq	%rsp, %rbp
00000000001bc314	pushq	%r15
00000000001bc316	pushq	%r14
00000000001bc318	pushq	%r13
00000000001bc31a	pushq	%r12
00000000001bc31c	pushq	%rbx
00000000001bc31d	subq	$0xe8, %rsp
00000000001bc324	movq	%rsi, %r15
00000000001bc327	movq	%rdi, %r14
00000000001bc32a	movss	0x198(%rdi), %xmm0
00000000001bc332	movaps	%xmm0, -0x60(%rbp)
00000000001bc336	movq	%rsi, %rdi
00000000001bc339	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
00000000001bc33e	movq	(%r14), %rcx
00000000001bc341	movq	%r14, %rdi
00000000001bc344	movq	%rax, %rsi
00000000001bc347	callq	*0x138(%rcx)
00000000001bc34d	movaps	-0x60(%rbp), %xmm8
00000000001bc352	movl	%eax, %r12d
00000000001bc355	movdqa	(%r15), %xmm0
00000000001bc35a	pshufd	$0xee, %xmm0, %xmm1             ## xmm1 = xmm0[2,3,2,3]
00000000001bc35f	psubd	%xmm0, %xmm1
00000000001bc363	pextrd	$0x1, %xmm1, %eax
00000000001bc369	movl	%eax, -0x2c(%rbp)
00000000001bc36c	testl	%eax, %eax
00000000001bc36e	jle	0x1bca69
00000000001bc374	movd	%xmm1, %eax
00000000001bc378	testl	%eax, %eax
00000000001bc37a	jle	0x1bca69
00000000001bc380	cvtdq2ps	%xmm0, %xmm9
00000000001bc384	mulps	0x20dd24(%rip), %xmm9
00000000001bc38c	addps	0x20dd2c(%rip), %xmm9
00000000001bc394	shufps	$0x0, %xmm8, %xmm8              ## xmm8 = xmm8[0,0,0,0]
00000000001bc399	movq	0x10(%r15), %rcx
00000000001bc39d	movq	%rcx, -0x38(%rbp)
00000000001bc3a1	movl	%eax, %eax
00000000001bc3a3	movq	%rax, -0x70(%rbp)
00000000001bc3a7	xorl	%eax, %eax
00000000001bc3a9	xorps	%xmm10, %xmm10
00000000001bc3ad	movaps	0x20b86b(%rip), %xmm11
00000000001bc3b5	movaps	0x20b883(%rip), %xmm12
00000000001bc3bd	movaps	%xmm9, %xmm0
00000000001bc3c1	movq	%r15, -0x78(%rbp)
00000000001bc3c5	movaps	%xmm8, -0x60(%rbp)
00000000001bc3ca	movaps	%xmm9, -0xc0(%rbp)
00000000001bc3d2	jmp	0x1bc409
00000000001bc3d4	nopw	%cs:(%rax,%rax)
00000000001bc3e0	movaps	-0xa0(%rbp), %xmm0
00000000001bc3e7	addps	0x20b8c2(%rip), %xmm0
00000000001bc3ee	movslq	0x18(%r15), %rax
00000000001bc3f2	shlq	$0x4, %rax
00000000001bc3f6	addq	%rax, -0x38(%rbp)
00000000001bc3fa	movq	-0x68(%rbp), %rax
00000000001bc3fe	incl	%eax
00000000001bc400	cmpl	-0x2c(%rbp), %eax
00000000001bc403	je	0x1bca69
00000000001bc409	movq	%rax, -0x68(%rbp)
00000000001bc40d	xorl	%esi, %esi
00000000001bc40f	movaps	%xmm0, -0xa0(%rbp)
00000000001bc416	movaps	%xmm0, %xmm13
00000000001bc41a	jmp	0x1bc46c
00000000001bc41c	nopl	(%rax)
00000000001bc420	mulps	0x6a1669(%rip), %xmm4
00000000001bc427	divps	%xmm5, %xmm4
00000000001bc42a	blendps	$0x8, -0xb0(%rbp), %xmm4        ## xmm4 = xmm4[0,1,2],mem[3]
00000000001bc434	minps	%xmm12, %xmm4
00000000001bc438	maxps	%xmm10, %xmm4
00000000001bc43c	movq	-0x80(%rbp), %rsi
00000000001bc440	movq	%rsi, %rax
00000000001bc443	shlq	$0x4, %rax
00000000001bc447	movq	-0x38(%rbp), %rcx
00000000001bc44b	movaps	%xmm4, (%rcx,%rax)
00000000001bc44f	movss	0x20b869(%rip), %xmm0
00000000001bc457	addps	%xmm0, %xmm13
00000000001bc45b	incq	%rsi
00000000001bc45e	cmpq	-0x70(%rbp), %rsi
00000000001bc462	movq	-0x78(%rbp), %r15
00000000001bc466	je	0x1bc3e0
00000000001bc46c	movaps	%xmm8, %xmm14
00000000001bc470	mulps	%xmm13, %xmm14
00000000001bc474	movq	0x60(%r15), %r8
00000000001bc478	movslq	0x68(%r15), %rdi
00000000001bc47c	subps	%xmm9, %xmm14
00000000001bc480	testl	%r12d, %r12d
00000000001bc483	je	0x1bc5c0
00000000001bc489	cvttps2dq	%xmm14, %xmm0
00000000001bc48e	movaps	%xmm14, %xmm1
00000000001bc492	cmpltps	%xmm10, %xmm1
00000000001bc497	paddd	%xmm0, %xmm1
00000000001bc49b	cvtdq2ps	%xmm1, %xmm0
00000000001bc49e	subps	%xmm0, %xmm14
00000000001bc4a2	pextrd	$0x1, %xmm1, %eax
00000000001bc4a8	movd	%xmm1, %ecx
00000000001bc4ac	imull	%edi, %eax
00000000001bc4af	addl	%ecx, %eax
00000000001bc4b1	cltq
00000000001bc4b3	shlq	$0x4, %rax
00000000001bc4b7	leaq	(%r8,%rax), %rcx
00000000001bc4bb	movaps	%xmm14, %xmm0
00000000001bc4bf	shufps	$0x0, %xmm14, %xmm0             ## xmm0 = xmm0[0,0],xmm14[0,0]
00000000001bc4c4	movaps	(%r8,%rax), %xmm1
00000000001bc4c9	movaps	0x10(%r8,%rax), %xmm2
00000000001bc4cf	subps	%xmm1, %xmm2
00000000001bc4d2	mulps	%xmm0, %xmm2
00000000001bc4d5	addps	%xmm1, %xmm2
00000000001bc4d8	movq	%rdi, %rax
00000000001bc4db	shlq	$0x4, %rax
00000000001bc4df	movaps	(%rax,%rcx), %xmm1
00000000001bc4e3	movaps	0x10(%rax,%rcx), %xmm3
00000000001bc4e8	subps	%xmm1, %xmm3
00000000001bc4eb	mulps	%xmm0, %xmm3
00000000001bc4ee	addps	%xmm1, %xmm3
00000000001bc4f1	subps	%xmm2, %xmm3
00000000001bc4f4	shufps	$0x55, %xmm14, %xmm14           ## xmm14 = xmm14[1,1,1,1]
00000000001bc4f9	mulps	%xmm3, %xmm14
00000000001bc4fd	addps	%xmm2, %xmm14
00000000001bc501	movshdup	%xmm14, %xmm0                   ## xmm0 = xmm14[1,1,3,3]
00000000001bc506	ucomiss	%xmm0, %xmm0
00000000001bc509	jnp	0x1bc512
00000000001bc50b	blendps	$0x2, %xmm10, %xmm14            ## xmm14 = xmm14[0],xmm10[1],xmm14[2,3]
00000000001bc512	movaps	%xmm14, %xmm0
00000000001bc516	unpckhpd	%xmm14, %xmm0                   ## xmm0 = xmm0[1],xmm14[1]
00000000001bc51b	ucomiss	%xmm0, %xmm0
00000000001bc51e	movq	%rsi, -0x80(%rbp)
00000000001bc522	jnp	0x1bc52b
00000000001bc524	blendps	$0x4, %xmm10, %xmm14            ## xmm14 = xmm14[0,1],xmm10[2],xmm14[3]
00000000001bc52b	movq	0x50(%r15), %rbx
00000000001bc52f	movslq	0x58(%r15), %r13
00000000001bc533	movaps	%xmm13, %xmm4
00000000001bc537	subps	%xmm9, %xmm4
00000000001bc53b	testl	%r12d, %r12d
00000000001bc53e	je	0x1bc610
00000000001bc544	cvttps2dq	%xmm4, %xmm0
00000000001bc548	movaps	%xmm4, %xmm1
00000000001bc54b	cmpltps	%xmm10, %xmm1
00000000001bc550	paddd	%xmm0, %xmm1
00000000001bc554	cvtdq2ps	%xmm1, %xmm0
00000000001bc557	subps	%xmm0, %xmm4
00000000001bc55a	pextrd	$0x1, %xmm1, %eax
00000000001bc560	movd	%xmm1, %ecx
00000000001bc564	imull	%r13d, %eax
00000000001bc568	addl	%ecx, %eax
00000000001bc56a	cltq
00000000001bc56c	shlq	$0x4, %rax
00000000001bc570	leaq	(%rbx,%rax), %rcx
00000000001bc574	movaps	%xmm4, %xmm0
00000000001bc577	shufps	$0x0, %xmm4, %xmm0              ## xmm0 = xmm0[0,0],xmm4[0,0]
00000000001bc57b	movaps	(%rbx,%rax), %xmm1
00000000001bc57f	movaps	0x10(%rbx,%rax), %xmm2
00000000001bc584	subps	%xmm1, %xmm2
00000000001bc587	mulps	%xmm0, %xmm2
00000000001bc58a	addps	%xmm1, %xmm2
00000000001bc58d	movq	%r13, %rax
00000000001bc590	shlq	$0x4, %rax
00000000001bc594	movaps	(%rax,%rcx), %xmm1
00000000001bc598	movaps	0x10(%rax,%rcx), %xmm3
00000000001bc59d	subps	%xmm1, %xmm3
00000000001bc5a0	mulps	%xmm0, %xmm3
00000000001bc5a3	addps	%xmm1, %xmm3
00000000001bc5a6	subps	%xmm2, %xmm3
00000000001bc5a9	shufps	$0x55, %xmm4, %xmm4             ## xmm4 = xmm4[1,1,1,1]
00000000001bc5ad	mulps	%xmm3, %xmm4
00000000001bc5b0	addps	%xmm2, %xmm4
00000000001bc5b3	jmp	0x1bc641
00000000001bc5b8	nopl	(%rax,%rax)
00000000001bc5c0	addps	0x20b6a8(%rip), %xmm14
00000000001bc5c8	cvtps2dq	%xmm14, %xmm0
00000000001bc5cd	cvtdq2ps	%xmm0, %xmm1
00000000001bc5d0	cmpltps	%xmm1, %xmm14
00000000001bc5d5	paddd	%xmm0, %xmm14
00000000001bc5da	movd	%xmm14, %eax
00000000001bc5df	pextrd	$0x1, %xmm14, %ecx
00000000001bc5e6	imull	%edi, %ecx
00000000001bc5e9	addl	%eax, %ecx
00000000001bc5eb	movslq	%ecx, %rax
00000000001bc5ee	shlq	$0x4, %rax
00000000001bc5f2	movaps	(%r8,%rax), %xmm14
00000000001bc5f7	movshdup	%xmm14, %xmm0                   ## xmm0 = xmm14[1,1,3,3]
00000000001bc5fc	ucomiss	%xmm0, %xmm0
00000000001bc5ff	jp	0x1bc50b
00000000001bc605	jmp	0x1bc512
00000000001bc60a	nopw	(%rax,%rax)
00000000001bc610	addps	0x20b659(%rip), %xmm4
00000000001bc617	cvtps2dq	%xmm4, %xmm0
00000000001bc61b	cvtdq2ps	%xmm0, %xmm1
00000000001bc61e	cmpltps	%xmm1, %xmm4
00000000001bc622	paddd	%xmm0, %xmm4
00000000001bc626	movd	%xmm4, %eax
00000000001bc62a	pextrd	$0x1, %xmm4, %ecx
00000000001bc630	imull	%r13d, %ecx
00000000001bc634	addl	%eax, %ecx
00000000001bc636	movslq	%ecx, %rax
00000000001bc639	shlq	$0x4, %rax
00000000001bc63d	movaps	(%rbx,%rax), %xmm4
00000000001bc641	shufps	$0xe9, %xmm10, %xmm14           ## xmm14 = xmm14[1,2],xmm10[2,3]
00000000001bc646	addps	%xmm14, %xmm14
00000000001bc64a	addps	%xmm11, %xmm14
00000000001bc64e	maxps	%xmm11, %xmm14
00000000001bc652	minps	%xmm12, %xmm14
00000000001bc656	movaps	%xmm14, %xmm15
00000000001bc65a	xorps	0x20da6e(%rip), %xmm15
00000000001bc662	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
00000000001bc668	movq	%rdi, %rax
00000000001bc66b	shlq	$0x4, %rax
00000000001bc66f	movq	%rax, -0x48(%rbp)
00000000001bc673	movq	%r13, %rax
00000000001bc676	shlq	$0x4, %rax
00000000001bc67a	movq	%rax, -0x88(%rbp)
00000000001bc681	movaps	%xmm4, -0xb0(%rbp)
00000000001bc688	movaps	0x6a1401(%rip), %xmm5
00000000001bc68f	movaps	%xmm13, -0xd0(%rbp)
00000000001bc697	movq	%r8, -0x40(%rbp)
00000000001bc69b	jmp	0x1bc715
00000000001bc69d	nopl	(%rax)
00000000001bc6a0	addps	0x20b5c9(%rip), %xmm1
00000000001bc6a7	cvtps2dq	%xmm1, %xmm4
00000000001bc6ab	cvtdq2ps	%xmm4, %xmm5
00000000001bc6ae	cmpltps	%xmm5, %xmm1
00000000001bc6b2	paddd	%xmm4, %xmm1
00000000001bc6b6	movd	%xmm1, %eax
00000000001bc6ba	pextrd	$0x1, %xmm1, %ecx
00000000001bc6c0	imull	%edi, %ecx
00000000001bc6c3	addl	%eax, %ecx
00000000001bc6c5	movslq	%ecx, %rax
00000000001bc6c8	shlq	$0x4, %rax
00000000001bc6cc	movaps	(%r8,%rax), %xmm1
00000000001bc6d1	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
00000000001bc6d5	movaps	-0xe0(%rbp), %xmm5
00000000001bc6dc	addps	%xmm0, %xmm5
00000000001bc6df	mulps	%xmm3, %xmm0
00000000001bc6e2	movaps	-0x100(%rbp), %xmm4
00000000001bc6e9	addps	%xmm0, %xmm4
00000000001bc6ec	addps	%xmm2, %xmm14
00000000001bc6f0	shufps	$0xe9, %xmm10, %xmm1            ## xmm1 = xmm1[1,2],xmm10[2,3]
00000000001bc6f5	addps	%xmm1, %xmm1
00000000001bc6f8	addps	%xmm11, %xmm1
00000000001bc6fc	maxps	%xmm11, %xmm1
00000000001bc700	minps	%xmm12, %xmm1
00000000001bc704	addps	%xmm1, %xmm15
00000000001bc708	decl	%r14d
00000000001bc70b	cmpl	$-0x8, %r14d
00000000001bc70f	je	0x1bc420
00000000001bc715	movaps	%xmm5, -0xe0(%rbp)
00000000001bc71c	movaps	%xmm15, -0xf0(%rbp)
00000000001bc724	movaps	%xmm4, -0x100(%rbp)
00000000001bc72b	movaps	%xmm14, -0x110(%rbp)
00000000001bc733	movq	%rdi, %r15
00000000001bc736	xorps	%xmm0, %xmm0
00000000001bc739	cvtsi2ss	%r14d, %xmm0
00000000001bc73e	divss	0x6a133e(%rip), %xmm0
00000000001bc746	callq	0x3c50fc                        ## symbol stub for: _expf
00000000001bc74b	movdqa	-0xf0(%rbp), %xmm15
00000000001bc754	movdqa	-0x110(%rbp), %xmm14
00000000001bc75d	movaps	-0xd0(%rbp), %xmm13
00000000001bc765	movaps	-0xc0(%rbp), %xmm9
00000000001bc76d	movq	%xmm14, %xmm2                   ## xmm2 = xmm14[0],zero
00000000001bc772	movq	%xmm15, %xmm1                   ## xmm1 = xmm15[0],zero
00000000001bc777	addps	%xmm13, %xmm2
00000000001bc77b	movaps	%xmm2, %xmm4
00000000001bc77e	subps	%xmm9, %xmm4
00000000001bc782	testl	%r12d, %r12d
00000000001bc785	je	0x1bc910
00000000001bc78b	cvttps2dq	%xmm4, %xmm3
00000000001bc78f	movaps	%xmm4, %xmm5
00000000001bc792	xorps	%xmm10, %xmm10
00000000001bc796	cmpltps	%xmm10, %xmm5
00000000001bc79b	paddd	%xmm3, %xmm5
00000000001bc79f	cvtdq2ps	%xmm5, %xmm3
00000000001bc7a2	subps	%xmm3, %xmm4
00000000001bc7a5	pextrd	$0x1, %xmm5, %eax
00000000001bc7ab	movd	%xmm5, %ecx
00000000001bc7af	imull	%r13d, %eax
00000000001bc7b3	addl	%ecx, %eax
00000000001bc7b5	cltq
00000000001bc7b7	shlq	$0x4, %rax
00000000001bc7bb	leaq	(%rbx,%rax), %rcx
00000000001bc7bf	movaps	%xmm4, %xmm3
00000000001bc7c2	shufps	$0x0, %xmm4, %xmm3              ## xmm3 = xmm3[0,0],xmm4[0,0]
00000000001bc7c6	movaps	(%rbx,%rax), %xmm5
00000000001bc7ca	movaps	0x10(%rbx,%rax), %xmm6
00000000001bc7cf	subps	%xmm5, %xmm6
00000000001bc7d2	mulps	%xmm3, %xmm6
00000000001bc7d5	addps	%xmm5, %xmm6
00000000001bc7d8	movq	-0x88(%rbp), %rdi
00000000001bc7df	movaps	(%rdi,%rcx), %xmm5
00000000001bc7e3	movaps	0x10(%rdi,%rcx), %xmm7
00000000001bc7e8	subps	%xmm5, %xmm7
00000000001bc7eb	mulps	%xmm3, %xmm7
00000000001bc7ee	addps	%xmm5, %xmm7
00000000001bc7f1	subps	%xmm6, %xmm7
00000000001bc7f4	shufps	$0x55, %xmm4, %xmm4             ## xmm4 = xmm4[1,1,1,1]
00000000001bc7f8	mulps	%xmm7, %xmm4
00000000001bc7fb	addps	%xmm6, %xmm4
00000000001bc7fe	addps	%xmm13, %xmm1
00000000001bc802	movaps	%xmm1, %xmm3
00000000001bc805	subps	%xmm9, %xmm3
00000000001bc809	cvttps2dq	%xmm3, %xmm5
00000000001bc80d	movaps	%xmm3, %xmm6
00000000001bc810	cmpltps	%xmm10, %xmm6
00000000001bc815	paddd	%xmm5, %xmm6
00000000001bc819	cvtdq2ps	%xmm6, %xmm5
00000000001bc81c	subps	%xmm5, %xmm3
00000000001bc81f	movd	%xmm6, %eax
00000000001bc823	pextrd	$0x1, %xmm6, %ecx
00000000001bc829	imull	%r13d, %ecx
00000000001bc82d	addl	%eax, %ecx
00000000001bc82f	movslq	%ecx, %rax
00000000001bc832	shlq	$0x4, %rax
00000000001bc836	leaq	(%rbx,%rax), %rcx
00000000001bc83a	movaps	%xmm3, %xmm5
00000000001bc83d	shufps	$0x0, %xmm3, %xmm5              ## xmm5 = xmm5[0,0],xmm3[0,0]
00000000001bc841	movaps	(%rbx,%rax), %xmm6
00000000001bc845	movaps	0x10(%rbx,%rax), %xmm7
00000000001bc84a	subps	%xmm6, %xmm7
00000000001bc84d	mulps	%xmm5, %xmm7
00000000001bc850	addps	%xmm6, %xmm7
00000000001bc853	movaps	(%rdi,%rcx), %xmm6
00000000001bc857	movaps	0x10(%rdi,%rcx), %xmm8
00000000001bc85d	subps	%xmm6, %xmm8
00000000001bc861	mulps	%xmm5, %xmm8
00000000001bc865	addps	%xmm6, %xmm8
00000000001bc869	subps	%xmm7, %xmm8
00000000001bc86d	shufps	$0x55, %xmm3, %xmm3             ## xmm3 = xmm3[1,1,1,1]
00000000001bc871	mulps	%xmm8, %xmm3
00000000001bc875	addps	%xmm7, %xmm3
00000000001bc878	addps	%xmm4, %xmm3
00000000001bc87b	movaps	-0x60(%rbp), %xmm8
00000000001bc880	mulps	%xmm8, %xmm2
00000000001bc884	subps	%xmm9, %xmm2
00000000001bc888	cvttps2dq	%xmm2, %xmm4
00000000001bc88c	movaps	%xmm2, %xmm5
00000000001bc88f	cmpltps	%xmm10, %xmm5
00000000001bc894	paddd	%xmm4, %xmm5
00000000001bc898	cvtdq2ps	%xmm5, %xmm4
00000000001bc89b	subps	%xmm4, %xmm2
00000000001bc89e	movd	%xmm5, %eax
00000000001bc8a2	pextrd	$0x1, %xmm5, %ecx
00000000001bc8a8	movq	%r15, %rdi
00000000001bc8ab	imull	%edi, %ecx
00000000001bc8ae	addl	%eax, %ecx
00000000001bc8b0	movslq	%ecx, %rax
00000000001bc8b3	shlq	$0x4, %rax
00000000001bc8b7	movq	-0x40(%rbp), %r8
00000000001bc8bb	leaq	(%r8,%rax), %rcx
00000000001bc8bf	movaps	%xmm2, %xmm4
00000000001bc8c2	shufps	$0x0, %xmm2, %xmm4              ## xmm4 = xmm4[0,0],xmm2[0,0]
00000000001bc8c6	movaps	(%r8,%rax), %xmm5
00000000001bc8cb	movaps	0x10(%r8,%rax), %xmm6
00000000001bc8d1	subps	%xmm5, %xmm6
00000000001bc8d4	mulps	%xmm4, %xmm6
00000000001bc8d7	addps	%xmm5, %xmm6
00000000001bc8da	movq	-0x48(%rbp), %rax
00000000001bc8de	movaps	(%rax,%rcx), %xmm5
00000000001bc8e2	movaps	0x10(%rax,%rcx), %xmm7
00000000001bc8e7	subps	%xmm5, %xmm7
00000000001bc8ea	mulps	%xmm4, %xmm7
00000000001bc8ed	addps	%xmm5, %xmm7
00000000001bc8f0	subps	%xmm6, %xmm7
00000000001bc8f3	shufps	$0x55, %xmm2, %xmm2             ## xmm2 = xmm2[1,1,1,1]
00000000001bc8f7	mulps	%xmm7, %xmm2
00000000001bc8fa	addps	%xmm6, %xmm2
00000000001bc8fd	jmp	0x1bc9c1
00000000001bc902	nopw	%cs:(%rax,%rax)
00000000001bc910	movaps	0x20b359(%rip), %xmm7
00000000001bc917	addps	%xmm7, %xmm4
00000000001bc91a	cvtps2dq	%xmm4, %xmm3
00000000001bc91e	cvtdq2ps	%xmm3, %xmm5
00000000001bc921	cmpltps	%xmm5, %xmm4
00000000001bc925	paddd	%xmm3, %xmm4
00000000001bc929	movd	%xmm4, %eax
00000000001bc92d	pextrd	$0x1, %xmm4, %ecx
00000000001bc933	imull	%r13d, %ecx
00000000001bc937	addl	%eax, %ecx
00000000001bc939	movslq	%ecx, %rax
00000000001bc93c	shlq	$0x4, %rax
00000000001bc940	movaps	(%rbx,%rax), %xmm3
00000000001bc944	addps	%xmm13, %xmm1
00000000001bc948	movaps	%xmm1, %xmm4
00000000001bc94b	subps	%xmm9, %xmm4
00000000001bc94f	addps	%xmm7, %xmm4
00000000001bc952	cvtps2dq	%xmm4, %xmm5
00000000001bc956	cvtdq2ps	%xmm5, %xmm6
00000000001bc959	cmpltps	%xmm6, %xmm4
00000000001bc95d	paddd	%xmm5, %xmm4
00000000001bc961	movd	%xmm4, %eax
00000000001bc965	pextrd	$0x1, %xmm4, %ecx
00000000001bc96b	imull	%r13d, %ecx
00000000001bc96f	addl	%eax, %ecx
00000000001bc971	movslq	%ecx, %rax
00000000001bc974	shlq	$0x4, %rax
00000000001bc978	addps	(%rbx,%rax), %xmm3
00000000001bc97c	movaps	-0x60(%rbp), %xmm8
00000000001bc981	mulps	%xmm8, %xmm2
00000000001bc985	subps	%xmm9, %xmm2
00000000001bc989	addps	%xmm7, %xmm2
00000000001bc98c	cvtps2dq	%xmm2, %xmm4
00000000001bc990	cvtdq2ps	%xmm4, %xmm5
00000000001bc993	cmpltps	%xmm5, %xmm2
00000000001bc997	paddd	%xmm4, %xmm2
00000000001bc99b	movd	%xmm2, %eax
00000000001bc99f	pextrd	$0x1, %xmm2, %ecx
00000000001bc9a5	movq	%r15, %rdi
00000000001bc9a8	imull	%edi, %ecx
00000000001bc9ab	addl	%eax, %ecx
00000000001bc9ad	movslq	%ecx, %rax
00000000001bc9b0	shlq	$0x4, %rax
00000000001bc9b4	movq	-0x40(%rbp), %r8
00000000001bc9b8	movaps	(%r8,%rax), %xmm2
00000000001bc9bd	xorps	%xmm10, %xmm10
00000000001bc9c1	movaps	0x20b257(%rip), %xmm11
00000000001bc9c9	movaps	0x20b26f(%rip), %xmm12
00000000001bc9d1	shufps	$0xe9, %xmm10, %xmm2            ## xmm2 = xmm2[1,2],xmm10[2,3]
00000000001bc9d6	addps	%xmm2, %xmm2
00000000001bc9d9	addps	%xmm11, %xmm2
00000000001bc9dd	maxps	%xmm11, %xmm2
00000000001bc9e1	minps	%xmm12, %xmm2
00000000001bc9e5	mulps	%xmm8, %xmm1
00000000001bc9e9	subps	%xmm9, %xmm1
00000000001bc9ed	testl	%r12d, %r12d
00000000001bc9f0	je	0x1bc6a0
00000000001bc9f6	cvttps2dq	%xmm1, %xmm4
00000000001bc9fa	movaps	%xmm1, %xmm5
00000000001bc9fd	cmpltps	%xmm10, %xmm5
00000000001bca02	paddd	%xmm4, %xmm5
00000000001bca06	cvtdq2ps	%xmm5, %xmm4
00000000001bca09	subps	%xmm4, %xmm1
00000000001bca0c	movd	%xmm5, %eax
00000000001bca10	pextrd	$0x1, %xmm5, %ecx
00000000001bca16	imull	%edi, %ecx
00000000001bca19	addl	%eax, %ecx
00000000001bca1b	movslq	%ecx, %rax
00000000001bca1e	shlq	$0x4, %rax
00000000001bca22	leaq	(%r8,%rax), %rcx
00000000001bca26	movaps	%xmm1, %xmm4
00000000001bca29	shufps	$0x0, %xmm1, %xmm4              ## xmm4 = xmm4[0,0],xmm1[0,0]
00000000001bca2d	movaps	(%r8,%rax), %xmm5
00000000001bca32	movaps	0x10(%r8,%rax), %xmm6
00000000001bca38	subps	%xmm5, %xmm6
00000000001bca3b	mulps	%xmm4, %xmm6
00000000001bca3e	addps	%xmm5, %xmm6
00000000001bca41	movq	-0x48(%rbp), %rax
00000000001bca45	movaps	(%rax,%rcx), %xmm5
00000000001bca49	movaps	0x10(%rax,%rcx), %xmm7
00000000001bca4e	subps	%xmm5, %xmm7
00000000001bca51	mulps	%xmm4, %xmm7
00000000001bca54	addps	%xmm5, %xmm7
00000000001bca57	subps	%xmm6, %xmm7
00000000001bca5a	shufps	$0x55, %xmm1, %xmm1             ## xmm1 = xmm1[1,1,1,1]
00000000001bca5e	mulps	%xmm7, %xmm1
00000000001bca61	addps	%xmm6, %xmm1
00000000001bca64	jmp	0x1bc6d1
00000000001bca69	xorl	%eax, %eax
00000000001bca6b	addq	$0xe8, %rsp
00000000001bca72	popq	%rbx
00000000001bca73	popq	%r12
00000000001bca75	popq	%r13
00000000001bca77	popq	%r14
00000000001bca79	popq	%r15
00000000001bca7b	popq	%rbp
00000000001bca7c	retq
00000000001bca7d	nopl	(%rax)
