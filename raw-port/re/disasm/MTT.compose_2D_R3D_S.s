__ZN26MaterialTextureTransformer23composeTextureTransformERK6CMTimeRK11OZChannel2DRK19OZChannelRotation3DRK14OZChannelScale:
00000000004af220	pushq	%rbp
00000000004af221	movq	%rsp, %rbp
00000000004af224	pushq	%r15
00000000004af226	pushq	%r14
00000000004af228	pushq	%r13
00000000004af22a	pushq	%r12
00000000004af22c	pushq	%rbx
00000000004af22d	subq	$0x28, %rsp
00000000004af231	movq	%r8, %r14
00000000004af234	movq	%rcx, %r12
00000000004af237	movq	%rdx, %r13
00000000004af23a	movq	%rsi, %r15
00000000004af23d	movq	%rdi, %rbx
00000000004af240	leaq	0x88(%rdx), %rdi
00000000004af247	xorps	%xmm0, %xmm0
00000000004af24a	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af24f	movsd	%xmm0, -0x30(%rbp)
00000000004af254	addq	$0x120, %r13                    ## imm = 0x120
00000000004af25b	xorps	%xmm0, %xmm0
00000000004af25e	movq	%r13, %rdi
00000000004af261	movq	%r15, %rsi
00000000004af264	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af269	movsd	-0x30(%rbp), %xmm1
00000000004af26e	movsd	%xmm1, -0x50(%rbp)
00000000004af273	movsd	%xmm0, -0x48(%rbp)
00000000004af278	addq	$0x1b8, %r12                    ## imm = 0x1B8
00000000004af27f	xorps	%xmm0, %xmm0
00000000004af282	movq	%r12, %rdi
00000000004af285	movq	%r15, %rsi
00000000004af288	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af28d	movsd	%xmm0, -0x30(%rbp)
00000000004af292	leaq	0x88(%r14), %rdi
00000000004af299	xorps	%xmm0, %xmm0
00000000004af29c	movq	%r15, %rsi
00000000004af29f	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af2a4	movsd	%xmm0, -0x40(%rbp)
00000000004af2a9	addq	$0x120, %r14                    ## imm = 0x120
00000000004af2b0	xorps	%xmm0, %xmm0
00000000004af2b3	movq	%r14, %rdi
00000000004af2b6	movq	%r15, %rsi
00000000004af2b9	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004af2be	movsd	%xmm0, -0x38(%rbp)
00000000004af2c3	leaq	-0x50(%rbp), %rsi
00000000004af2c7	leaq	-0x40(%rbp), %rdx
00000000004af2cb	movq	%rbx, %rdi
00000000004af2ce	movsd	-0x30(%rbp), %xmm0
00000000004af2d3	callq	__ZN26MaterialTextureTransformer23composeTextureTransformERK9PCVector2IdEdS3_ ## MaterialTextureTransformer::composeTextureTransform(PCVector2<double> const&, double, PCVector2<double> const&)
00000000004af2d8	movq	%rbx, %rax
00000000004af2db	addq	$0x28, %rsp
00000000004af2df	popq	%rbx
00000000004af2e0	popq	%r12
00000000004af2e2	popq	%r13
00000000004af2e4	popq	%r14
00000000004af2e6	popq	%r15
00000000004af2e8	popq	%rbp
00000000004af2e9	retq
00000000004af2ea	nopw	(%rax,%rax)