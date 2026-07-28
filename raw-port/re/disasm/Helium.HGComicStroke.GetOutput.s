__ZN13HGComicStroke9GetOutputEP10HGRenderer:
0000000000170f90	pushq	%rbp
0000000000170f91	movq	%rsp, %rbp
0000000000170f94	pushq	%rbx
0000000000170f95	pushq	%rax
0000000000170f96	movq	%rdi, %rbx
0000000000170f99	movss	0x198(%rdi), %xmm0
0000000000170fa1	xorps	%xmm1, %xmm1
0000000000170fa4	xorps	%xmm2, %xmm2
0000000000170fa7	xorps	%xmm3, %xmm3
0000000000170faa	xorl	%esi, %esi
0000000000170fac	callq	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
0000000000170fb1	movss	0x256d07(%rip), %xmm1
0000000000170fb9	movss	0x19c(%rbx), %xmm0
0000000000170fc1	cmpeqss	%xmm1, %xmm0
0000000000170fc6	andps	%xmm1, %xmm0
0000000000170fc9	xorps	%xmm1, %xmm1
0000000000170fcc	xorps	%xmm2, %xmm2
0000000000170fcf	xorps	%xmm3, %xmm3
0000000000170fd2	movq	%rbx, %rdi
0000000000170fd5	movl	$0x1, %esi
0000000000170fda	callq	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
0000000000170fdf	movss	0x1a0(%rbx), %xmm0
0000000000170fe7	movss	0x256cd1(%rip), %xmm1
0000000000170fef	cmpeqss	%xmm1, %xmm0
0000000000170ff4	andps	%xmm1, %xmm0
0000000000170ff7	xorps	%xmm1, %xmm1
0000000000170ffa	xorps	%xmm2, %xmm2
0000000000170ffd	xorps	%xmm3, %xmm3
0000000000171000	movq	%rbx, %rdi
0000000000171003	movl	$0x2, %esi
0000000000171008	callq	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
000000000017100d	movss	0x1a0(%rbx), %xmm0
0000000000171015	xorps	%xmm1, %xmm1
0000000000171018	ucomiss	%xmm1, %xmm0
000000000017101b	jne	0x17103e
000000000017101d	jp	0x17103e
000000000017101f	movq	(%rbx), %rax
0000000000171022	movq	%rbx, %rdi
0000000000171025	xorl	%esi, %esi
0000000000171027	callq	*0x80(%rax)
000000000017102d	movq	(%rbx), %rcx
0000000000171030	movq	%rbx, %rdi
0000000000171033	movl	$0x1, %esi
0000000000171038	movq	%rax, %rdx
000000000017103b	callq	*0x78(%rcx)
000000000017103e	movq	%rbx, %rax
0000000000171041	addq	$0x8, %rsp
0000000000171045	popq	%rbx
0000000000171046	popq	%rbp
0000000000171047	retq
0000000000171048	nopl	(%rax,%rax)
