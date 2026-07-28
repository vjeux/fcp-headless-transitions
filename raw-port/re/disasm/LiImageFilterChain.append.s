__ZN18LiImageFilterChain6appendEP13LiImageFilter:
00000000000a6c80	pushq	%rbp
00000000000a6c81	movq	%rsp, %rbp
00000000000a6c84	pushq	%r15
00000000000a6c86	pushq	%r14
00000000000a6c88	pushq	%r12
00000000000a6c8a	pushq	%rbx
00000000000a6c8b	subq	$0x20, %rsp
00000000000a6c8f	movq	%rdi, %rbx
00000000000a6c92	leaq	0x10(%rdi), %r15
00000000000a6c96	movq	%rsi, -0x38(%rbp)
00000000000a6c9a	testq	%rsi, %rsi
00000000000a6c9d	je	0xa6ca8
00000000000a6c9f	movq	(%rsi), %rax
00000000000a6ca2	addq	-0x18(%rax), %rsi
00000000000a6ca6	jmp	0xa6caa
00000000000a6ca8	xorl	%esi, %esi
00000000000a6caa	leaq	-0x30(%rbp), %r14
00000000000a6cae	movq	%r14, %rdi
00000000000a6cb1	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000000a6cb6	movl	0x18(%rbx), %eax
00000000000a6cb9	movl	0x1c(%rbx), %ecx
00000000000a6cbc	leal	0x1(%rcx), %esi
00000000000a6cbf	cmpl	%eax, %ecx
00000000000a6cc1	leal	0x3(%rcx,%rcx), %edx
00000000000a6cc5	cmovll	%eax, %edx
00000000000a6cc8	movq	%r15, %rdi
00000000000a6ccb	callq	__ZN7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE6resizeEii ## PCArray<PCPtr<LiImageFilter>, PCArray_Traits<PCPtr<LiImageFilter>>>::resize(int, int)
00000000000a6cd0	movq	0x20(%rbx), %r15
00000000000a6cd4	movslq	0x1c(%rbx), %r12
00000000000a6cd8	shlq	$0x4, %r12
00000000000a6cdc	movq	-0x38(%rbp), %rax
00000000000a6ce0	movq	%rax, -0x10(%r15,%r12)
00000000000a6ce5	leaq	-0x28(%rbp), %rdi
00000000000a6ce9	movq	%r14, %rsi
00000000000a6cec	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000000a6cf1	addq	%r12, %r15
00000000000a6cf4	addq	$-0x8, %r15
00000000000a6cf8	leaq	-0x28(%rbp), %rsi
00000000000a6cfc	movq	%r15, %rdi
00000000000a6cff	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000000a6d04	leaq	-0x28(%rbp), %rdi
00000000000a6d08	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000a6d0d	movq	%r14, %rdi
00000000000a6d10	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000a6d15	movq	%rbx, %rdi
00000000000a6d18	callq	0x6de424                        ## symbol stub for: __ZN18LiImageFilterChain7connectEv
00000000000a6d1d	addq	$0x20, %rsp
00000000000a6d21	popq	%rbx
00000000000a6d22	popq	%r12
00000000000a6d24	popq	%r14
00000000000a6d26	popq	%r15
00000000000a6d28	popq	%rbp
00000000000a6d29	retq
00000000000a6d2a	movq	%rax, %rbx
00000000000a6d2d	leaq	-0x28(%rbp), %rdi
00000000000a6d31	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000a6d36	movq	%r14, %rdi
00000000000a6d39	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000a6d3e	movq	%rbx, %rdi
00000000000a6d41	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a6d46	movq	%rax, %rbx
00000000000a6d49	movq	%r14, %rdi
00000000000a6d4c	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000000a6d51	movq	%rbx, %rdi
00000000000a6d54	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a6d59	nopl	(%rax)
