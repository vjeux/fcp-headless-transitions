__ZN14HGColorConform19SetConversionStaticEP12CGColorSpaceS1_PP31HGColorConformNodeListCacheItem:
00000000001ca1a0	pushq	%rbp
00000000001ca1a1	movq	%rsp, %rbp
00000000001ca1a4	pushq	%r15
00000000001ca1a6	pushq	%r14
00000000001ca1a8	pushq	%r12
00000000001ca1aa	pushq	%rbx
00000000001ca1ab	subq	$0x30, %rsp
00000000001ca1af	movq	0x8380a2(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca1b6	movq	(%rax), %rax
00000000001ca1b9	movq	%rax, -0x28(%rbp)
00000000001ca1bd	testq	%rdi, %rdi
00000000001ca1c0	setne	%al
00000000001ca1c3	testq	%rsi, %rsi
00000000001ca1c6	setne	%cl
00000000001ca1c9	testb	%cl, %al
00000000001ca1cb	je	0x1ca21d
00000000001ca1cd	movq	%rdx, %r14
00000000001ca1d0	movq	%rdi, %rbx
00000000001ca1d3	movq	%rsi, %r15
00000000001ca1d6	callq	0x3c4afc                        ## symbol stub for: _CFEqual
00000000001ca1db	movb	$0x1, %r12b
00000000001ca1de	testb	%al, %al
00000000001ca1e0	jne	0x1ca302
00000000001ca1e6	movq	%rbx, %rdi
00000000001ca1e9	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001ca1ee	testq	%rax, %rax
00000000001ca1f1	je	0x1ca233
00000000001ca1f3	movq	%rax, %r12
00000000001ca1f6	movq	%rax, %rdi
00000000001ca1f9	xorl	%esi, %esi
00000000001ca1fb	callq	0x3c4d96                        ## symbol stub for: _ColorSyncProfileCreate
00000000001ca200	movq	%rax, %rbx
00000000001ca203	movq	%r12, %rdi
00000000001ca206	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca20b	movq	%r15, %rdi
00000000001ca20e	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001ca213	testq	%rax, %rax
00000000001ca216	jne	0x1ca246
00000000001ca218	jmp	0x1ca2f2
00000000001ca21d	leaq	0x72c018(%rip), %rdi            ## literal pool for: "SetConversionStatic does not allow NULL CGColorSpaceRef"
00000000001ca224	xorl	%r12d, %r12d
00000000001ca227	xorl	%eax, %eax
00000000001ca229	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000001ca22e	jmp	0x1ca302
00000000001ca233	movq	%r15, %rdi
00000000001ca236	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001ca23b	xorl	%ebx, %ebx
00000000001ca23d	testq	%rax, %rax
00000000001ca240	je	0x1ca2ff
00000000001ca246	movq	%rax, %r12
00000000001ca249	movq	%rax, %rdi
00000000001ca24c	xorl	%esi, %esi
00000000001ca24e	callq	0x3c4d96                        ## symbol stub for: _ColorSyncProfileCreate
00000000001ca253	movq	%rax, %r15
00000000001ca256	movq	%r12, %rdi
00000000001ca259	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca25e	testq	%rbx, %rbx
00000000001ca261	setne	%al
00000000001ca264	testq	%r15, %r15
00000000001ca267	setne	%cl
00000000001ca26a	andb	%al, %cl
00000000001ca26c	cmpb	$0x1, %cl
00000000001ca26f	jne	0x1ca2e5
00000000001ca271	movq	%rbx, %rdi
00000000001ca274	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001ca279	movq	%rax, -0x38(%rbp)
00000000001ca27d	movq	%rdx, -0x30(%rbp)
00000000001ca281	movq	%r15, %rdi
00000000001ca284	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001ca289	movq	%rax, -0x48(%rbp)
00000000001ca28d	movq	%rdx, -0x40(%rbp)
00000000001ca291	movdqu	-0x38(%rbp), %xmm0
00000000001ca296	movdqu	-0x48(%rbp), %xmm1
00000000001ca29b	pxor	%xmm0, %xmm1
00000000001ca29f	movb	$0x1, %r12b
00000000001ca2a2	ptest	%xmm1, %xmm1
00000000001ca2a7	je	0x1ca2d3
00000000001ca2a9	movq	%rbx, %rdi
00000000001ca2ac	movq	%r15, %rsi
00000000001ca2af	movq	%r14, %rdx
00000000001ca2b2	xorl	%ecx, %ecx
00000000001ca2b4	callq	__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb ## HGColorConform::DecodeFragmentList(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**, bool)
00000000001ca2b9	testb	%al, %al
00000000001ca2bb	jne	0x1ca2d3
00000000001ca2bd	movq	%rbx, %rdi
00000000001ca2c0	movq	%r15, %rsi
00000000001ca2c3	movq	%r14, %rdx
00000000001ca2c6	movl	$0x1, %ecx
00000000001ca2cb	callq	__ZN14HGColorConform18DecodeFragmentListEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItemb ## HGColorConform::DecodeFragmentList(ColorSyncProfile const*, ColorSyncProfile const*, HGColorConformNodeListCacheItem**, bool)
00000000001ca2d0	movl	%eax, %r12d
00000000001ca2d3	movq	%rbx, %rdi
00000000001ca2d6	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca2db	movq	%r15, %rdi
00000000001ca2de	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca2e3	jmp	0x1ca302
00000000001ca2e5	testq	%r15, %r15
00000000001ca2e8	je	0x1ca2f2
00000000001ca2ea	movq	%r15, %rdi
00000000001ca2ed	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca2f2	testq	%rbx, %rbx
00000000001ca2f5	je	0x1ca2ff
00000000001ca2f7	movq	%rbx, %rdi
00000000001ca2fa	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca2ff	xorl	%r12d, %r12d
00000000001ca302	movq	0x837f4f(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001ca309	movq	(%rax), %rax
00000000001ca30c	cmpq	-0x28(%rbp), %rax
00000000001ca310	jne	0x1ca322
00000000001ca312	movl	%r12d, %eax
00000000001ca315	addq	$0x30, %rsp
00000000001ca319	popq	%rbx
00000000001ca31a	popq	%r12
00000000001ca31c	popq	%r14
00000000001ca31e	popq	%r15
00000000001ca320	popq	%rbp
00000000001ca321	retq
00000000001ca322	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001ca327	nopw	(%rax,%rax)
