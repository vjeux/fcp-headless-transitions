__ZN30OZ3DEnginePhysicsFieldBehavior10halfExtentERK6CMTime:
00000000004f0ce0	pushq	%rbp
00000000004f0ce1	movq	%rsp, %rbp
00000000004f0ce4	pushq	%r15
00000000004f0ce6	pushq	%r14
00000000004f0ce8	pushq	%rbx
00000000004f0ce9	subq	$0x18, %rsp
00000000004f0ced	movq	%rdx, %r14
00000000004f0cf0	movq	%rsi, %r15
00000000004f0cf3	movq	%rdi, %rbx
00000000004f0cf6	leaq	0x560(%rsi), %rdi
00000000004f0cfd	xorps	%xmm0, %xmm0
00000000004f0d00	movq	%rdx, %rsi
00000000004f0d03	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004f0d08	movsd	%xmm0, -0x28(%rbp)
00000000004f0d0d	leaq	0x5f8(%r15), %rdi
00000000004f0d14	xorps	%xmm0, %xmm0
00000000004f0d17	movq	%r14, %rsi
00000000004f0d1a	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004f0d1f	movsd	%xmm0, -0x20(%rbp)
00000000004f0d24	addq	$0x690, %r15                    ## imm = 0x690
00000000004f0d2b	xorps	%xmm0, %xmm0
00000000004f0d2e	movq	%r15, %rdi
00000000004f0d31	movq	%r14, %rsi
00000000004f0d34	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004f0d39	movsd	-0x28(%rbp), %xmm1
00000000004f0d3e	movsd	%xmm1, (%rbx)
00000000004f0d42	movsd	-0x20(%rbp), %xmm1
00000000004f0d47	movsd	%xmm1, 0x8(%rbx)
00000000004f0d4c	movsd	%xmm0, 0x10(%rbx)
00000000004f0d51	movq	%rbx, %rax
00000000004f0d54	addq	$0x18, %rsp
00000000004f0d58	popq	%rbx
00000000004f0d59	popq	%r14
00000000004f0d5b	popq	%r15
00000000004f0d5d	popq	%rbp
00000000004f0d5e	retq
00000000004f0d5f	nop
