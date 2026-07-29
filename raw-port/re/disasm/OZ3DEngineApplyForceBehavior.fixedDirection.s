__ZNK28OZ3DEngineApplyForceBehavior14fixedDirectionERK6CMTime:
0000000000266bb0	pushq	%rbp
0000000000266bb1	movq	%rsp, %rbp
0000000000266bb4	pushq	%r15
0000000000266bb6	pushq	%r14
0000000000266bb8	pushq	%rbx
0000000000266bb9	subq	$0x18, %rsp
0000000000266bbd	movq	%rdx, %r14
0000000000266bc0	movq	%rsi, %r15
0000000000266bc3	movq	%rdi, %rbx
0000000000266bc6	leaq	0x398(%rsi), %rdi
0000000000266bcd	xorps	%xmm0, %xmm0
0000000000266bd0	movq	%rdx, %rsi
0000000000266bd3	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000266bd8	movsd	%xmm0, -0x28(%rbp)
0000000000266bdd	leaq	0x430(%r15), %rdi
0000000000266be4	xorps	%xmm0, %xmm0
0000000000266be7	movq	%r14, %rsi
0000000000266bea	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000266bef	movsd	%xmm0, -0x20(%rbp)
0000000000266bf4	addq	$0x4c8, %r15                    ## imm = 0x4C8
0000000000266bfb	xorps	%xmm0, %xmm0
0000000000266bfe	movq	%r15, %rdi
0000000000266c01	movq	%r14, %rsi
0000000000266c04	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000266c09	movsd	-0x28(%rbp), %xmm1
0000000000266c0e	movsd	%xmm1, (%rbx)
0000000000266c12	movsd	-0x20(%rbp), %xmm1
0000000000266c17	movsd	%xmm1, 0x8(%rbx)
0000000000266c1c	movsd	%xmm0, 0x10(%rbx)
0000000000266c21	movq	%rbx, %rax
0000000000266c24	addq	$0x18, %rsp
0000000000266c28	popq	%rbx
0000000000266c29	popq	%r14
0000000000266c2b	popq	%r15
0000000000266c2d	popq	%rbp
0000000000266c2e	retq
0000000000266c2f	nop
