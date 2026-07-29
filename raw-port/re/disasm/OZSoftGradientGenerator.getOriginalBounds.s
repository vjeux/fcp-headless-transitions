__ZN23OZSoftGradientGenerator17getOriginalBoundsEP6PCRectIdERK13OZRenderState:
00000000004d7dd0	pushq	%rbp
00000000004d7dd1	movq	%rsp, %rbp
00000000004d7dd4	pushq	%rbx
00000000004d7dd5	pushq	%rax
00000000004d7dd6	movq	%rsi, %rbx
00000000004d7dd9	addq	$0x5038, %rdi                   ## imm = 0x5038
00000000004d7de0	xorpd	%xmm0, %xmm0
00000000004d7de4	movq	%rdx, %rsi
00000000004d7de7	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004d7dec	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
00000000004d7df0	xorpd	0x22f768(%rip), %xmm1
00000000004d7df8	addsd	%xmm0, %xmm0
00000000004d7dfc	movupd	%xmm1, (%rbx)
00000000004d7e00	movsd	%xmm0, 0x10(%rbx)
00000000004d7e05	movsd	%xmm0, 0x18(%rbx)
00000000004d7e0a	addq	$0x8, %rsp
00000000004d7e0e	popq	%rbx
00000000004d7e0f	popq	%rbp
00000000004d7e10	retq
00000000004d7e11	nopw	%cs:(%rax,%rax)
