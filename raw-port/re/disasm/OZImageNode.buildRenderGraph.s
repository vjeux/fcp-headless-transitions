__ZN11OZImageNode16buildRenderGraphER14OZRenderParamsP14LiGraphBuilderRK18OZRenderGraphState:
00000000001a4020	pushq	%rbp
00000000001a4021	movq	%rsp, %rbp
00000000001a4024	pushq	%r15
00000000001a4026	pushq	%r14
00000000001a4028	pushq	%rbx
00000000001a4029	subq	$0x38, %rsp
00000000001a402d	movq	%rdx, %r14
00000000001a4030	movq	%rsi, %rdx
00000000001a4033	movq	%rdi, %rsi
00000000001a4036	movq	(%rdi), %rax
00000000001a4039	leaq	-0x40(%rbp), %rdi
00000000001a403d	xorl	%r8d, %r8d
00000000001a4040	callq	*0x98(%rax)
00000000001a4046	movl	$0x2f0, %edi                    ## imm = 0x2F0
00000000001a404b	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000001a4050	movq	%rax, %r15
00000000001a4053	movq	-0x40(%rbp), %rsi
00000000001a4057	movq	%rax, %rdi
00000000001a405a	callq	0x6debd4                        ## symbol stub for: __ZN7LiGeodeC1EP13LiImageSource
00000000001a405f	movq	%r15, -0x50(%rbp)
00000000001a4063	movq	(%r15), %rax
00000000001a4066	addq	-0x18(%rax), %r15
00000000001a406a	leaq	-0x48(%rbp), %rbx
00000000001a406e	movq	%rbx, %rdi
00000000001a4071	movq	%r15, %rsi
00000000001a4074	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001a4079	movq	-0x50(%rbp), %rax
00000000001a407d	movq	%rax, -0x30(%rbp)
00000000001a4081	leaq	-0x28(%rbp), %r15
00000000001a4085	movq	%r15, %rdi
00000000001a4088	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000001a408d	cmpq	$0x0, -0x30(%rbp)
00000000001a4092	je	0x1a40b5
00000000001a4094	leaq	-0x20(%rbp), %rdi
00000000001a4098	movq	%rbx, %rsi
00000000001a409b	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001a40a0	leaq	-0x20(%rbp), %rsi
00000000001a40a4	movq	%r15, %rdi
00000000001a40a7	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
00000000001a40ac	leaq	-0x20(%rbp), %rdi
00000000001a40b0	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a40b5	leaq	-0x30(%rbp), %rsi
00000000001a40b9	movq	%r14, %rdi
00000000001a40bc	callq	0x6ddbde                        ## symbol stub for: __ZN14LiGraphBuilder5add2dERK5PCPtrI13LiSceneObjectE
00000000001a40c1	movq	%r15, %rdi
00000000001a40c4	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a40c9	movq	%rbx, %rdi
00000000001a40cc	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a40d1	leaq	-0x38(%rbp), %rdi
00000000001a40d5	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a40da	addq	$0x38, %rsp
00000000001a40de	popq	%rbx
00000000001a40df	popq	%r14
00000000001a40e1	popq	%r15
00000000001a40e3	popq	%rbp
00000000001a40e4	retq
00000000001a40e5	movq	%rax, %r14
00000000001a40e8	leaq	-0x20(%rbp), %rdi
00000000001a40ec	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a40f1	jmp	0x1a40f8
00000000001a40f3	jmp	0x1a40f5
00000000001a40f5	movq	%rax, %r14
00000000001a40f8	movq	%r15, %rdi
00000000001a40fb	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a4100	jmp	0x1a4105
00000000001a4102	movq	%rax, %r14
00000000001a4105	movq	%rbx, %rdi
00000000001a4108	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a410d	leaq	-0x38(%rbp), %rdi
00000000001a4111	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a4116	movq	%r14, %rdi
00000000001a4119	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a411e	movq	%rax, %r14
00000000001a4121	movq	%r15, %rdi
00000000001a4124	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001a4129	leaq	-0x38(%rbp), %rdi
00000000001a412d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a4132	movq	%r14, %rdi
00000000001a4135	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a413a	movq	%rax, %r14
00000000001a413d	leaq	-0x38(%rbp), %rdi
00000000001a4141	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a4146	movq	%r14, %rdi
00000000001a4149	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a414e	nop
