__ZN30OZ3DEnginePhysicsFieldBehavior9directionERK6CMTime:
00000000004f0d60	pushq	%rbp
00000000004f0d61	movq	%rsp, %rbp
00000000004f0d64	pushq	%r15
00000000004f0d66	pushq	%r14
00000000004f0d68	pushq	%rbx
00000000004f0d69	subq	$0x18, %rsp
00000000004f0d6d	movq	%rdx, %r14
00000000004f0d70	movq	%rsi, %r15
00000000004f0d73	movq	%rdi, %rbx
00000000004f0d76	leaq	0x7b0(%rsi), %rdi
00000000004f0d7d	xorps	%xmm0, %xmm0
00000000004f0d80	movq	%rdx, %rsi
00000000004f0d83	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004f0d88	movsd	%xmm0, -0x28(%rbp)
00000000004f0d8d	leaq	0x848(%r15), %rdi
00000000004f0d94	xorps	%xmm0, %xmm0
00000000004f0d97	movq	%r14, %rsi
00000000004f0d9a	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004f0d9f	movsd	%xmm0, -0x20(%rbp)
00000000004f0da4	addq	$0x8e0, %r15                    ## imm = 0x8E0
00000000004f0dab	xorps	%xmm0, %xmm0
00000000004f0dae	movq	%r15, %rdi
00000000004f0db1	movq	%r14, %rsi
00000000004f0db4	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004f0db9	movsd	-0x28(%rbp), %xmm1
00000000004f0dbe	movsd	%xmm1, (%rbx)
00000000004f0dc2	movsd	-0x20(%rbp), %xmm1
00000000004f0dc7	movsd	%xmm1, 0x8(%rbx)
00000000004f0dcc	movsd	%xmm0, 0x10(%rbx)
00000000004f0dd1	movq	%rbx, %rax
00000000004f0dd4	addq	$0x18, %rsp
00000000004f0dd8	popq	%rbx
00000000004f0dd9	popq	%r14
00000000004f0ddb	popq	%r15
00000000004f0ddd	popq	%rbp
00000000004f0dde	retq
00000000004f0ddf	nop
