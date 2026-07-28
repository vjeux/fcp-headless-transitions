__ZN28OZLiSegmentationStrokeFilter9getHeliumER7LiAgent:
00000000004246a0	pushq	%rbp
00000000004246a1	movq	%rsp, %rbp
00000000004246a4	pushq	%r15
00000000004246a6	pushq	%r14
00000000004246a8	pushq	%r13
00000000004246aa	pushq	%r12
00000000004246ac	pushq	%rbx
00000000004246ad	subq	$0x118, %rsp                    ## imm = 0x118
00000000004246b4	movq	%rdx, %rax
00000000004246b7	movq	%rsi, %rbx
00000000004246ba	movq	%rdi, %r15
00000000004246bd	movq	0x10(%rsi), %rdx
00000000004246c1	leaq	-0x40(%rbp), %rdi
00000000004246c5	movq	%rax, -0xf8(%rbp)
00000000004246cc	movq	%rax, %rsi
00000000004246cf	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
00000000004246d4	movq	-0x40(%rbp), %r12
00000000004246d8	movq	%r12, (%r15)
00000000004246db	testq	%r12, %r12
00000000004246de	je	0x4246ea
00000000004246e0	movq	(%r12), %rax
00000000004246e4	movq	%r12, %rdi
00000000004246e7	callq	*0x10(%rax)
00000000004246ea	movq	0x40(%rbx), %rax
00000000004246ee	movq	%rax, -0x130(%rbp)
00000000004246f5	movupd	0x30(%rbx), %xmm0
00000000004246fa	movapd	%xmm0, -0x140(%rbp)
0000000000424702	movq	0x28(%rbx), %rdi
0000000000424706	leaq	-0x140(%rbp), %rsi
000000000042470d	callq	__ZN11OZImageMask22hasSegmentationStrokesERK6CMTime ## OZImageMask::hasSegmentationStrokes(CMTime const&)
0000000000424712	testb	%al, %al
0000000000424714	je	0x424ae7
000000000042471a	leaq	0x30(%rbx), %r14
000000000042471e	xorpd	%xmm0, %xmm0
0000000000424722	movapd	%xmm0, -0x120(%rbp)
000000000042472a	movapd	0x2e0c8e(%rip), %xmm0
0000000000424732	movapd	%xmm0, -0x110(%rbp)
000000000042473a	movq	0x28(%rbx), %rdi
000000000042473e	movq	(%rdi), %rax
0000000000424741	leaq	-0x120(%rbp), %rsi
0000000000424748	movq	%r14, %rdx
000000000042474b	callq	*0x4e0(%rax)
0000000000424751	movq	0x28(%rbx), %rsi
0000000000424755	leaq	-0x58(%rbp), %rdi
0000000000424759	movq	%r14, %rdx
000000000042475c	callq	__ZN11OZImageMask26getSegmentationStrokeNodesERK14OZRenderParams ## OZImageMask::getSegmentationStrokeNodes(OZRenderParams const&)
0000000000424761	movq	0x28(%rbx), %rdi
0000000000424765	callq	__ZN11OZImageMask45getSegmentationResultSequencePixelAspectRatioEv ## OZImageMask::getSegmentationResultSequencePixelAspectRatio()
000000000042476a	movq	%r15, -0x30(%rbp)
000000000042476e	movq	-0x58(%rbp), %rbx
0000000000424772	movq	-0x50(%rbp), %r14
0000000000424776	cmpq	%rbx, %r14
0000000000424779	je	0x424a9d
000000000042477f	movsd	%xmm0, -0x60(%rbp)
0000000000424784	movl	$0x1, %r13d
000000000042478a	xorl	%r15d, %r15d
000000000042478d	leaq	__ZTV20HMaskSimpleStrokeAdd(%rip), %rax ## vtable for HMaskSimpleStrokeAdd
0000000000424794	addq	$0x10, %rax
0000000000424798	movq	%rax, -0xf0(%rbp)
000000000042479f	leaq	__ZTV25HMaskSimpleStrokeSubtract(%rip), %rax ## vtable for HMaskSimpleStrokeSubtract
00000000004247a6	addq	$0x10, %rax
00000000004247aa	movq	%rax, -0xe8(%rbp)
00000000004247b1	nopw	%cs:(%rax,%rax)
00000000004247c0	movq	-0xf8(%rbp), %rax
00000000004247c7	movq	0xa0(%rax), %rax
00000000004247ce	movups	0x70(%rax), %xmm0
00000000004247d2	movaps	%xmm0, -0x70(%rbp)
00000000004247d6	movups	0x60(%rax), %xmm0
00000000004247da	movaps	%xmm0, -0x80(%rbp)
00000000004247de	movups	0x50(%rax), %xmm0
00000000004247e2	movaps	%xmm0, -0x90(%rbp)
00000000004247e9	movups	0x40(%rax), %xmm0
00000000004247ed	movaps	%xmm0, -0xa0(%rbp)
00000000004247f4	movups	(%rax), %xmm0
00000000004247f7	movupd	0x10(%rax), %xmm1
00000000004247fc	movups	0x20(%rax), %xmm2
0000000000424800	movups	0x30(%rax), %xmm3
0000000000424804	movaps	%xmm3, -0xb0(%rbp)
000000000042480b	movaps	%xmm2, -0xc0(%rbp)
0000000000424812	movapd	%xmm1, -0xd0(%rbp)
000000000042481a	movaps	%xmm0, -0xe0(%rbp)
0000000000424821	movsd	-0x110(%rbp), %xmm0
0000000000424829	mulsd	0x2e2eef(%rip), %xmm0
0000000000424831	mulsd	-0x60(%rbp), %xmm0
0000000000424836	xorpd	%xmm1, %xmm1
000000000042483a	ucomisd	%xmm1, %xmm0
000000000042483e	jne	0x424842
0000000000424840	jnp	0x4248a5
0000000000424842	movsd	-0xe0(%rbp), %xmm1
000000000042484a	mulsd	%xmm0, %xmm1
000000000042484e	addsd	-0xc8(%rbp), %xmm1
0000000000424856	movsd	%xmm1, -0xc8(%rbp)
000000000042485e	movsd	-0xc0(%rbp), %xmm1
0000000000424866	mulsd	%xmm0, %xmm1
000000000042486a	addsd	-0xa8(%rbp), %xmm1
0000000000424872	movsd	%xmm1, -0xa8(%rbp)
000000000042487a	movsd	-0xa0(%rbp), %xmm1
0000000000424882	mulsd	%xmm0, %xmm1
0000000000424886	addsd	-0x88(%rbp), %xmm1
000000000042488e	movsd	%xmm1, -0x88(%rbp)
0000000000424896	mulsd	-0x80(%rbp), %xmm0
000000000042489b	addsd	-0x68(%rbp), %xmm0
00000000004248a0	movsd	%xmm0, -0x68(%rbp)
00000000004248a5	movsd	-0x108(%rbp), %xmm0
00000000004248ad	mulsd	0x2e2e6b(%rip), %xmm0
00000000004248b5	xorpd	%xmm1, %xmm1
00000000004248b9	ucomisd	%xmm1, %xmm0
00000000004248bd	jne	0x4248c1
00000000004248bf	jnp	0x424924
00000000004248c1	movsd	-0xd8(%rbp), %xmm1
00000000004248c9	mulsd	%xmm0, %xmm1
00000000004248cd	addsd	-0xc8(%rbp), %xmm1
00000000004248d5	movsd	%xmm1, -0xc8(%rbp)
00000000004248dd	movsd	-0xb8(%rbp), %xmm1
00000000004248e5	mulsd	%xmm0, %xmm1
00000000004248e9	addsd	-0xa8(%rbp), %xmm1
00000000004248f1	movsd	%xmm1, -0xa8(%rbp)
00000000004248f9	movsd	-0x98(%rbp), %xmm1
0000000000424901	mulsd	%xmm0, %xmm1
0000000000424905	addsd	-0x88(%rbp), %xmm1
000000000042490d	movsd	%xmm1, -0x88(%rbp)
0000000000424915	mulsd	-0x78(%rbp), %xmm0
000000000042491a	addsd	-0x68(%rbp), %xmm0
000000000042491f	movsd	%xmm0, -0x68(%rbp)
0000000000424924	movsd	-0x60(%rbp), %xmm1
0000000000424929	ucomisd	0x2e0aaf(%rip), %xmm1
0000000000424931	jne	0x424935
0000000000424933	jnp	0x42497f
0000000000424935	movsd	-0xe0(%rbp), %xmm0
000000000042493d	mulsd	%xmm1, %xmm0
0000000000424941	movsd	%xmm0, -0xe0(%rbp)
0000000000424949	movsd	-0xc0(%rbp), %xmm0
0000000000424951	mulsd	%xmm1, %xmm0
0000000000424955	movsd	%xmm0, -0xc0(%rbp)
000000000042495d	movsd	-0xa0(%rbp), %xmm0
0000000000424965	mulsd	%xmm1, %xmm0
0000000000424969	movsd	%xmm0, -0xa0(%rbp)
0000000000424971	movsd	-0x80(%rbp), %xmm0
0000000000424976	mulsd	%xmm1, %xmm0
000000000042497a	movsd	%xmm0, -0x80(%rbp)
000000000042497f	leaq	-0x38(%rbp), %rdi
0000000000424983	leaq	-0xe0(%rbp), %rsi
000000000042498a	callq	0x6df102                        ## symbol stub for: __ZN8PGHelium17convertPCMatrix44ERK14PCMatrix44TmplIdE
000000000042498f	movl	$0x210, %edi                    ## imm = 0x210
0000000000424994	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
0000000000424999	movq	%rax, %rbx
000000000042499c	movq	%rax, %rdi
000000000042499f	callq	0x6deb4a                        ## symbol stub for: __ZN7HGXFormC1Ev
00000000004249a4	movq	-0x58(%rbp), %rax
00000000004249a8	shlq	$0x4, %r15
00000000004249ac	movq	(%rax,%r15), %rdx
00000000004249b0	movq	(%rbx), %rax
00000000004249b3	xorl	%r14d, %r14d
00000000004249b6	movq	%rbx, %rdi
00000000004249b9	xorl	%esi, %esi
00000000004249bb	callq	*0x78(%rax)
00000000004249be	movq	-0x38(%rbp), %rsi
00000000004249c2	movq	(%rbx), %rax
00000000004249c5	xorl	%r14d, %r14d
00000000004249c8	movq	%rbx, %rdi
00000000004249cb	callq	*0x230(%rax)
00000000004249d1	movq	-0x58(%rbp), %rax
00000000004249d5	cmpl	$0x1, 0x8(%rax,%r15)
00000000004249db	jne	0x424a00
00000000004249dd	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000004249e2	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
00000000004249e7	movq	%rax, %r14
00000000004249ea	movq	%rax, %rdi
00000000004249ed	callq	__ZN16HgcMaskStrokeAddC2Ev      ## HgcMaskStrokeAdd::HgcMaskStrokeAdd()
00000000004249f2	movq	-0xf0(%rbp), %rax
00000000004249f9	jmp	0x424a1c
00000000004249fb	nopl	(%rax,%rax)
0000000000424a00	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000424a05	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
0000000000424a0a	movq	%rax, %r14
0000000000424a0d	movq	%rax, %rdi
0000000000424a10	callq	__ZN21HgcMaskStrokeSubtractC2Ev ## HgcMaskStrokeSubtract::HgcMaskStrokeSubtract()
0000000000424a15	movq	-0xe8(%rbp), %rax
0000000000424a1c	movq	%rax, (%r14)
0000000000424a1f	movq	%r14, %rdi
0000000000424a22	xorl	%esi, %esi
0000000000424a24	movq	%rbx, %rdx
0000000000424a27	callq	*0x78(%rax)
0000000000424a2a	movq	(%r14), %rax
0000000000424a2d	movq	%r14, %rdi
0000000000424a30	movl	$0x1, %esi
0000000000424a35	movq	%r12, %rdx
0000000000424a38	callq	*0x78(%rax)
0000000000424a3b	cmpq	%r14, %r12
0000000000424a3e	je	0x424a5b
0000000000424a40	testq	%r12, %r12
0000000000424a43	je	0x424a4f
0000000000424a45	movq	(%r12), %rax
0000000000424a49	movq	%r12, %rdi
0000000000424a4c	callq	*0x18(%rax)
0000000000424a4f	movq	(%r14), %rax
0000000000424a52	movq	%r14, %r12
0000000000424a55	movq	%r14, %rdi
0000000000424a58	callq	*0x10(%rax)
0000000000424a5b	movq	(%rbx), %rax
0000000000424a5e	movq	%rbx, %rdi
0000000000424a61	callq	*0x18(%rax)
0000000000424a64	movq	-0x38(%rbp), %rdi
0000000000424a68	testq	%rdi, %rdi
0000000000424a6b	je	0x424a73
0000000000424a6d	movq	(%rdi), %rax
0000000000424a70	callq	*0x18(%rax)
0000000000424a73	movq	(%r14), %rax
0000000000424a76	movq	%r14, %rdi
0000000000424a79	callq	*0x18(%rax)
0000000000424a7c	movl	%r13d, %r15d
0000000000424a7f	movq	-0x58(%rbp), %rbx
0000000000424a83	movq	-0x50(%rbp), %r14
0000000000424a87	movq	%r14, %rax
0000000000424a8a	subq	%rbx, %rax
0000000000424a8d	sarq	$0x4, %rax
0000000000424a91	incl	%r13d
0000000000424a94	cmpq	%r15, %rax
0000000000424a97	ja	0x4247c0
0000000000424a9d	movq	-0x30(%rbp), %r15
0000000000424aa1	movq	%r12, (%r15)
0000000000424aa4	testq	%rbx, %rbx
0000000000424aa7	je	0x424ae7
0000000000424aa9	movq	%rbx, %rdi
0000000000424aac	cmpq	%r14, %rbx
0000000000424aaf	jne	0x424ac9
0000000000424ab1	jmp	0x424ade
0000000000424ab3	nopw	%cs:(%rax,%rax)
0000000000424ac0	addq	$-0x10, %r14
0000000000424ac4	cmpq	%rbx, %r14
0000000000424ac7	je	0x424ada
0000000000424ac9	movq	-0x10(%r14), %rdi
0000000000424acd	testq	%rdi, %rdi
0000000000424ad0	je	0x424ac0
0000000000424ad2	movq	(%rdi), %rax
0000000000424ad5	callq	*0x18(%rax)
0000000000424ad8	jmp	0x424ac0
0000000000424ada	movq	-0x58(%rbp), %rdi
0000000000424ade	movq	%rbx, -0x50(%rbp)
0000000000424ae2	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000424ae7	movq	-0x40(%rbp), %rdi
0000000000424aeb	testq	%rdi, %rdi
0000000000424aee	je	0x424af6
0000000000424af0	movq	(%rdi), %rax
0000000000424af3	callq	*0x18(%rax)
0000000000424af6	movq	%r15, %rax
0000000000424af9	addq	$0x118, %rsp                    ## imm = 0x118
0000000000424b00	popq	%rbx
0000000000424b01	popq	%r12
0000000000424b03	popq	%r13
0000000000424b05	popq	%r14
0000000000424b07	popq	%r15
0000000000424b09	popq	%rbp
0000000000424b0a	retq
0000000000424b0b	movq	%rax, %r15
0000000000424b0e	jmp	0x424bf4
0000000000424b13	jmp	0x424b27
0000000000424b15	jmp	0x424b27
0000000000424b17	movq	%rax, %rdi
0000000000424b1a	callq	___clang_call_terminate
0000000000424b1f	movq	%rax, %r15
0000000000424b22	jmp	0x424c0c
0000000000424b27	movq	%rax, %r15
0000000000424b2a	jmp	0x424bfd
0000000000424b2f	movq	%rax, %rdi
0000000000424b32	callq	___clang_call_terminate
0000000000424b37	jmp	0x424b39
0000000000424b39	movq	%rax, %r15
0000000000424b3c	movq	-0x30(%rbp), %rax
0000000000424b40	movq	%r12, (%rax)
0000000000424b43	movq	%r14, %rdi
0000000000424b46	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
0000000000424b4b	xorl	%r14d, %r14d
0000000000424b4e	jmp	0x424bc7
0000000000424b50	jmp	0x424b52
0000000000424b52	movq	%rax, %r15
0000000000424b55	movq	-0x30(%rbp), %rax
0000000000424b59	movq	%r12, (%rax)
0000000000424b5c	xorl	%r14d, %r14d
0000000000424b5f	jmp	0x424bc7
0000000000424b61	movq	-0x30(%rbp), %rcx
0000000000424b65	movq	%r12, (%rcx)
0000000000424b68	movq	%rax, %rdi
0000000000424b6b	callq	___clang_call_terminate
0000000000424b70	movq	-0x30(%rbp), %rcx
0000000000424b74	movq	%r12, (%rcx)
0000000000424b77	movq	%rax, %rdi
0000000000424b7a	callq	___clang_call_terminate
0000000000424b7f	movq	-0x30(%rbp), %rcx
0000000000424b83	movq	%r12, (%rcx)
0000000000424b86	movq	%rax, %rdi
0000000000424b89	callq	___clang_call_terminate
0000000000424b8e	movq	%rax, %r15
0000000000424b91	movq	-0x30(%rbp), %rax
0000000000424b95	movq	%r12, (%rax)
0000000000424b98	jmp	0x424bf4
0000000000424b9a	movq	%rax, %r15
0000000000424b9d	movq	-0x30(%rbp), %rax
0000000000424ba1	movq	%r12, (%rax)
0000000000424ba4	jmp	0x424bb8
0000000000424ba6	movq	%rax, %r15
0000000000424ba9	movq	-0x30(%rbp), %rax
0000000000424bad	movq	%r12, (%rax)
0000000000424bb0	movq	%rbx, %rdi
0000000000424bb3	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
0000000000424bb8	xorl	%r14d, %r14d
0000000000424bbb	jmp	0x424bd0
0000000000424bbd	movq	%rax, %r15
0000000000424bc0	movq	-0x30(%rbp), %rax
0000000000424bc4	movq	%r12, (%rax)
0000000000424bc7	movq	(%rbx), %rax
0000000000424bca	movq	%rbx, %rdi
0000000000424bcd	callq	*0x18(%rax)
0000000000424bd0	movq	-0x38(%rbp), %rdi
0000000000424bd4	testq	%rdi, %rdi
0000000000424bd7	je	0x424bdf
0000000000424bd9	movq	(%rdi), %rax
0000000000424bdc	callq	*0x18(%rax)
0000000000424bdf	testq	%r14, %r14
0000000000424be2	je	0x424bf4
0000000000424be4	movq	(%r14), %rax
0000000000424be7	movq	%r14, %rdi
0000000000424bea	callq	*0x18(%rax)
0000000000424bed	movq	-0x30(%rbp), %rax
0000000000424bf1	movq	(%rax), %r12
0000000000424bf4	leaq	-0x58(%rbp), %rdi
0000000000424bf8	callq	__ZNSt3__16vectorINS_4pairI5HGRefI6HGNodeEiEENS_9allocatorIS5_EEED1B9nqe210106Ev ## std::__1::vector<std::__1::pair<HGRef<HGNode>, int>, std::__1::allocator<std::__1::pair<HGRef<HGNode>, int>>>::~vector[abi:nqe210106]()
0000000000424bfd	testq	%r12, %r12
0000000000424c00	je	0x424c0c
0000000000424c02	movq	(%r12), %rax
0000000000424c06	movq	%r12, %rdi
0000000000424c09	callq	*0x18(%rax)
0000000000424c0c	movq	-0x40(%rbp), %rdi
0000000000424c10	testq	%rdi, %rdi
0000000000424c13	je	0x424c1b
0000000000424c15	movq	(%rdi), %rax
0000000000424c18	callq	*0x18(%rax)
0000000000424c1b	movq	%r15, %rdi
0000000000424c1e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424c23	movq	%rax, %rdi
0000000000424c26	callq	___clang_call_terminate
0000000000424c2b	movq	%rax, %rdi
0000000000424c2e	callq	___clang_call_terminate
0000000000424c33	movq	%rax, %rdi
0000000000424c36	callq	___clang_call_terminate
0000000000424c3b	movq	%rax, %rdi
0000000000424c3e	callq	___clang_call_terminate
0000000000424c43	movq	%rax, %rdi
0000000000424c46	callq	___clang_call_terminate
0000000000424c4b	nopl	(%rax,%rax)
