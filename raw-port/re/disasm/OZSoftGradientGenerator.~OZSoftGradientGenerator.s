__ZN23OZSoftGradientGeneratorD0Ev:
00000000004d79c0	pushq	%rbp
00000000004d79c1	movq	%rsp, %rbp
00000000004d79c4	pushq	%r14
00000000004d79c6	pushq	%rbx
00000000004d79c7	movq	%rdi, %rbx
00000000004d79ca	leaq	0x39e047(%rip), %rax
00000000004d79d1	movq	%rax, (%rdi)
00000000004d79d4	leaq	0x39e975(%rip), %rax
00000000004d79db	movq	%rax, 0x10(%rdi)
00000000004d79df	leaq	0x39ebc2(%rip), %rax
00000000004d79e6	movq	%rax, 0x28(%rdi)
00000000004d79ea	leaq	0x39ec0f(%rip), %rax
00000000004d79f1	movq	%rax, 0x1978(%rdi)
00000000004d79f8	addq	$0x5038, %rdi                   ## imm = 0x5038
00000000004d79ff	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004d7a04	leaq	0x4bb0(%rbx), %r14
00000000004d7a0b	movq	0x34ae9e(%rip), %rax            ## literal pool symbol address: __ZTV14OZChannelColor
00000000004d7a12	leaq	0x10(%rax), %rcx
00000000004d7a16	movq	%rcx, 0x4bb0(%rbx)
00000000004d7a1d	addq	$0x370, %rax                    ## imm = 0x370
00000000004d7a23	movq	%rax, 0x4bc0(%rbx)
00000000004d7a2a	leaq	0x4fa0(%rbx), %rdi
00000000004d7a31	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004d7a36	movq	0x34aeb3(%rip), %rax            ## literal pool symbol address: __ZTV21OZChannelColorNoAlpha
00000000004d7a3d	leaq	0x10(%rax), %rcx
00000000004d7a41	movq	%rcx, 0x4bb0(%rbx)
00000000004d7a48	addq	$0x370, %rax                    ## imm = 0x370
00000000004d7a4e	movq	%rax, 0x4bc0(%rbx)
00000000004d7a55	leaq	0x4e98(%rbx), %rdi
00000000004d7a5c	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004d7a61	leaq	0x4e00(%rbx), %rdi
00000000004d7a68	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004d7a6d	leaq	0x4d68(%rbx), %rdi
00000000004d7a74	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004d7a79	leaq	0x4cd0(%rbx), %rdi
00000000004d7a80	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004d7a85	leaq	0x4c38(%rbx), %rdi
00000000004d7a8c	callq	0x6df480                        ## symbol stub for: __ZN9OZChannelD2Ev
00000000004d7a91	movq	%r14, %rdi
00000000004d7a94	callq	0x6de2b6                        ## symbol stub for: __ZN17OZCompoundChannelD2Ev
00000000004d7a99	movq	%rbx, %rdi
00000000004d7a9c	callq	__ZN16OZImageGeneratorD2Ev      ## OZImageGenerator::~OZImageGenerator()
00000000004d7aa1	movq	%rbx, %rdi
00000000004d7aa4	popq	%rbx
00000000004d7aa5	popq	%r14
00000000004d7aa7	popq	%rbp
00000000004d7aa8	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004d7aad	nopl	(%rax)
