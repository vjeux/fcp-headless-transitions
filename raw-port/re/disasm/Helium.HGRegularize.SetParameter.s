__ZN12HGRegularize12SetParameterEiffff:
00000000001c35b0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001c35b5	testl	%esi, %esi
00000000001c35b7	je	0x1c35ba
00000000001c35b9	retq
00000000001c35ba	movss	0x1a8(%rdi), %xmm1
00000000001c35c2	ucomiss	%xmm0, %xmm1
00000000001c35c5	jne	0x1c35c9
00000000001c35c7	jnp	0x1c35e1
00000000001c35c9	pushq	%rbp
00000000001c35ca	movq	%rsp, %rbp
00000000001c35cd	movss	%xmm0, 0x1a8(%rdi)
00000000001c35d5	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c35da	movl	$0x1, %eax
00000000001c35df	popq	%rbp
00000000001c35e0	retq
00000000001c35e1	xorl	%eax, %eax
00000000001c35e3	retq
00000000001c35e4	nopw	%cs:(%rax,%rax)
