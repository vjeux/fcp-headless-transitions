__ZN9HGSharpen12SetIntensityEf:
0000000000040020	pushq	%rbp
0000000000040021	movq	%rsp, %rbp
0000000000040024	pushq	%rbx
0000000000040025	pushq	%rax
0000000000040026	movss	%xmm0, -0xc(%rbp)
000000000004002b	movq	%rdi, %rbx
000000000004002e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000040033	movss	-0xc(%rbp), %xmm0
0000000000040038	movss	%xmm0, 0x1a0(%rbx)
0000000000040040	movq	0x1b0(%rbx), %rdi
0000000000040047	movq	(%rdi), %rax
000000000004004a	movq	0x60(%rax), %rax
000000000004004e	xorps	%xmm3, %xmm3
0000000000040051	xorl	%esi, %esi
0000000000040053	movaps	%xmm0, %xmm1
0000000000040056	movaps	%xmm0, %xmm2
0000000000040059	addq	$0x8, %rsp
000000000004005d	popq	%rbx
000000000004005e	popq	%rbp
000000000004005f	jmpq	*%rax
0000000000040061	nopw	%cs:(%rax,%rax)
