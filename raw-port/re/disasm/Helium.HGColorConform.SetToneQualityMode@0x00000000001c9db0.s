__ZN14HGColorConform18SetToneQualityModeENS_25hgColorConformToneQualityE:
00000000001c9db0	cmpl	%esi, 0x1b4(%rdi)
00000000001c9db6	je	0x1c9dd4
00000000001c9db8	pushq	%rbp
00000000001c9db9	movq	%rsp, %rbp
00000000001c9dbc	pushq	%r14
00000000001c9dbe	pushq	%rbx
00000000001c9dbf	movl	%esi, %ebx
00000000001c9dc1	movq	%rdi, %r14
00000000001c9dc4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c9dc9	movl	%ebx, 0x1b4(%r14)
00000000001c9dd0	popq	%rbx
00000000001c9dd1	popq	%r14
00000000001c9dd3	popq	%rbp
00000000001c9dd4	retq
00000000001c9dd5	nopw	%cs:(%rax,%rax)
