__ZN22HGTexturePoolingPolicyC2Ev:
0000000000044c30	pushq	%rbp
0000000000044c31	movq	%rsp, %rbp
0000000000044c34	pushq	%rbx
0000000000044c35	pushq	%rax
0000000000044c36	movq	%rdi, %rbx
0000000000044c39	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000044c3e	leaq	0x9c2a13(%rip), %rax
0000000000044c45	movq	%rax, (%rbx)
0000000000044c48	movq	$0x0, 0x10(%rbx)
0000000000044c50	addq	$0x8, %rsp
0000000000044c54	popq	%rbx
0000000000044c55	popq	%rbp
0000000000044c56	retq
0000000000044c57	nopw	(%rax,%rax)
