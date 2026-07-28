__ZN17HGBilateralFilter22SetFilterSpatialWindowEf:
00000000001c89a0	pushq	%rbp
00000000001c89a1	movq	%rsp, %rbp
00000000001c89a4	pushq	%rbx
00000000001c89a5	pushq	%rax
00000000001c89a6	movss	%xmm0, -0xc(%rbp)
00000000001c89ab	movq	%rdi, %rbx
00000000001c89ae	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c89b3	movss	-0xc(%rbp), %xmm0
00000000001c89b8	movss	%xmm0, 0x1b0(%rbx)
00000000001c89c0	addq	$0x8, %rsp
00000000001c89c4	popq	%rbx
00000000001c89c5	popq	%rbp
00000000001c89c6	retq
00000000001c89c7	nopw	(%rax,%rax)
