__ZN34HGInterlaceHandler_InterlaceFields12SetParameterEiffff:
0000000000093240	pushq	%rbp
0000000000093241	movq	%rsp, %rbp
0000000000093244	pushq	%rbx
0000000000093245	pushq	%rax
0000000000093246	movss	%xmm0, -0xc(%rbp)
000000000009324b	movq	%rdi, %rbx
000000000009324e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000093253	xorps	%xmm0, %xmm0
0000000000093256	cmpneqss	-0xc(%rbp), %xmm0
000000000009325c	movd	%xmm0, %eax
0000000000093260	andl	$0x1, %eax
0000000000093263	movl	%eax, 0x1a0(%rbx)
0000000000093269	movl	$0x1, %eax
000000000009326e	addq	$0x8, %rsp
0000000000093272	popq	%rbx
0000000000093273	popq	%rbp
0000000000093274	retq
0000000000093275	nopw	%cs:(%rax,%rax)
