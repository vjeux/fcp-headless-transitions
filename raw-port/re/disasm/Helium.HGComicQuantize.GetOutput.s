__ZN15HGComicQuantize9GetOutputEP10HGRenderer:
0000000000007db0	pushq	%rbp
0000000000007db1	movq	%rsp, %rbp
0000000000007db4	pushq	%rbx
0000000000007db5	pushq	%rax
0000000000007db6	movq	%rdi, %rbx
0000000000007db9	movss	0x198(%rdi), %xmm0
0000000000007dc1	movss	0x3bfef7(%rip), %xmm1
0000000000007dc9	divss	%xmm0, %xmm1
0000000000007dcd	xorps	%xmm2, %xmm2
0000000000007dd0	xorps	%xmm3, %xmm3
0000000000007dd3	xorl	%esi, %esi
0000000000007dd5	callq	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
0000000000007dda	movq	%rbx, %rax
0000000000007ddd	addq	$0x8, %rsp
0000000000007de1	popq	%rbx
0000000000007de2	popq	%rbp
0000000000007de3	retq
0000000000007de4	nopw	%cs:(%rax,%rax)
