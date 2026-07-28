__ZNK29OZLiSegmentationFeatherFilter5cloneEv:
0000000000424e20	pushq	%rbp
0000000000424e21	movq	%rsp, %rbp
0000000000424e24	pushq	%r15
0000000000424e26	pushq	%r14
0000000000424e28	pushq	%r12
0000000000424e2a	pushq	%rbx
0000000000424e2b	subq	$0x20, %rsp
0000000000424e2f	movq	%rsi, %r15
0000000000424e32	movq	%rdi, %r14
0000000000424e35	movl	$0x600, %edi                    ## imm = 0x600
0000000000424e3a	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000424e3f	movq	%rax, %rbx
0000000000424e42	movq	0x28(%r15), %rsi
0000000000424e46	leaq	0x30(%r15), %rdx
0000000000424e4a	movq	%rax, %rdi
0000000000424e4d	callq	__ZN29OZLiSegmentationFeatherFilterC1EP11OZImageMaskRK14OZRenderParams ## OZLiSegmentationFeatherFilter::OZLiSegmentationFeatherFilter(OZImageMask*, OZRenderParams const&)
0000000000424e52	movq	%rbx, -0x38(%rbp)
0000000000424e56	movq	(%rbx), %rax
0000000000424e59	movq	-0x18(%rax), %rsi
0000000000424e5d	addq	%rbx, %rsi
0000000000424e60	leaq	-0x30(%rbp), %rbx
0000000000424e64	movq	%rbx, %rdi
0000000000424e67	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
0000000000424e6c	movq	-0x38(%rbp), %r12
0000000000424e70	testq	%r12, %r12
0000000000424e73	jne	0x424e83
0000000000424e75	movl	$0x1, %edi
0000000000424e7a	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
0000000000424e7f	movq	-0x38(%rbp), %r12
0000000000424e83	movq	0x10(%r15), %rax
0000000000424e87	movq	%rax, 0x10(%r12)
0000000000424e8c	leaq	0x18(%r15), %rsi
0000000000424e90	leaq	-0x28(%rbp), %rdi
0000000000424e94	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
0000000000424e99	leaq	0x18(%r12), %rdi
0000000000424e9e	leaq	-0x28(%rbp), %rsi
0000000000424ea2	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
0000000000424ea7	leaq	-0x28(%rbp), %rdi
0000000000424eab	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424eb0	movl	0x20(%r15), %eax
0000000000424eb4	movl	%eax, 0x20(%r12)
0000000000424eb9	movq	-0x38(%rbp), %rax
0000000000424ebd	movq	%rax, (%r14)
0000000000424ec0	leaq	0x8(%r14), %r15
0000000000424ec4	movq	%r15, %rdi
0000000000424ec7	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
0000000000424ecc	cmpq	$0x0, (%r14)
0000000000424ed0	je	0x424ef3
0000000000424ed2	leaq	-0x28(%rbp), %rdi
0000000000424ed6	movq	%rbx, %rsi
0000000000424ed9	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
0000000000424ede	leaq	-0x28(%rbp), %rsi
0000000000424ee2	movq	%r15, %rdi
0000000000424ee5	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
0000000000424eea	leaq	-0x28(%rbp), %rdi
0000000000424eee	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424ef3	movq	%rbx, %rdi
0000000000424ef6	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424efb	movq	%r14, %rax
0000000000424efe	addq	$0x20, %rsp
0000000000424f02	popq	%rbx
0000000000424f03	popq	%r12
0000000000424f05	popq	%r14
0000000000424f07	popq	%r15
0000000000424f09	popq	%rbp
0000000000424f0a	retq
0000000000424f0b	movq	%rax, %r14
0000000000424f0e	leaq	-0x28(%rbp), %rdi
0000000000424f12	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424f17	jmp	0x424f1c
0000000000424f19	movq	%rax, %r14
0000000000424f1c	movq	%r15, %rdi
0000000000424f1f	jmp	0x424f28
0000000000424f21	movq	%rax, %r14
0000000000424f24	leaq	-0x28(%rbp), %rdi
0000000000424f28	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424f2d	movq	%rbx, %rdi
0000000000424f30	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424f35	movq	%r14, %rdi
0000000000424f38	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424f3d	movq	%rax, %r14
0000000000424f40	movq	%rbx, %rdi
0000000000424f43	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000424f48	movq	%r14, %rdi
0000000000424f4b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424f50	movq	%rax, %r14
0000000000424f53	movq	%rbx, %rdi
0000000000424f56	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000424f5b	movq	%r14, %rdi
0000000000424f5e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424f63	nopw	%cs:(%rax,%rax)
