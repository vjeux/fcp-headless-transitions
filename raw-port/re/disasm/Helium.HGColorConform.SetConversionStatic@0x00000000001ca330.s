__ZN14HGColorConform19SetConversionStaticEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItem:
00000000001ca330	pushq	%rbp
00000000001ca331	movq	%rsp, %rbp
00000000001ca334	pushq	%r15
00000000001ca336	pushq	%r14
00000000001ca338	pushq	%rbx
00000000001ca339	subq	$0x28, %rsp
00000000001ca33d	movq	%rdx, %rbx
00000000001ca340	movq	%rsi, %r14
00000000001ca343	movq	%rdi, %r15
00000000001ca346	movq	0x837f0b(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca34d	movq	(%rax), %rax
00000000001ca350	movq	%rax, -0x20(%rbp)
00000000001ca354	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001ca359	movq	%rax, -0x30(%rbp)
00000000001ca35d	movq	%rdx, -0x28(%rbp)
00000000001ca361	movq	%r14, %rdi
00000000001ca364	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001ca369	movq	%rax, -0x40(%rbp)
00000000001ca36d	movq	%rdx, -0x38(%rbp)
00000000001ca371	movdqu	-0x30(%rbp), %xmm0
00000000001ca376	movdqu	-0x40(%rbp), %xmm1
00000000001ca37b	pxor	%xmm0, %xmm1
00000000001ca37f	ptest	%xmm1, %xmm1
00000000001ca384	je	0x1ca39a
00000000001ca386	movq	%r15, %rdi
00000000001ca389	movq	%r14, %rsi
00000000001ca38c	movq	%rbx, %rdx
00000000001ca38f	xorl	%ecx, %ecx
00000000001ca391	callq	__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb ## HGColorConform::DecodeFragmentList(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**, bool)
00000000001ca396	testb	%al, %al
00000000001ca398	je	0x1ca3b7
00000000001ca39a	movq	0x837eb7(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca3a1	movq	(%rax), %rax
00000000001ca3a4	cmpq	-0x20(%rbp), %rax
00000000001ca3a8	jne	0x1ca3e4
00000000001ca3aa	movb	$0x1, %al
00000000001ca3ac	addq	$0x28, %rsp
00000000001ca3b0	popq	%rbx
00000000001ca3b1	popq	%r14
00000000001ca3b3	popq	%r15
00000000001ca3b5	popq	%rbp
00000000001ca3b6	retq
00000000001ca3b7	movq	0x837e9a(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca3be	movq	(%rax), %rax
00000000001ca3c1	cmpq	-0x20(%rbp), %rax
00000000001ca3c5	jne	0x1ca3e4
00000000001ca3c7	movq	%r15, %rdi
00000000001ca3ca	movq	%r14, %rsi
00000000001ca3cd	movq	%rbx, %rdx
00000000001ca3d0	movl	$0x1, %ecx
00000000001ca3d5	addq	$0x28, %rsp
00000000001ca3d9	popq	%rbx
00000000001ca3da	popq	%r14
00000000001ca3dc	popq	%r15
00000000001ca3de	popq	%rbp
00000000001ca3df	jmp	__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb ## HGColorConform::DecodeFragmentList(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**, bool)
00000000001ca3e4	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001ca3e9	nopl	(%rax)
