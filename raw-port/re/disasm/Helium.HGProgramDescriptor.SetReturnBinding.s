__ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding:
0000000000167f30	pushq	%rbp
0000000000167f31	movq	%rsp, %rbp
0000000000167f34	pushq	%r14
0000000000167f36	pushq	%rbx
0000000000167f37	movq	%rsi, %rbx
0000000000167f3a	movq	%rdi, %r14
0000000000167f3d	movl	(%rsi), %eax
0000000000167f3f	movl	%eax, 0xb8(%rdi)
0000000000167f45	addq	$0xc0, %rdi
0000000000167f4c	addq	$0x8, %rsi
0000000000167f50	callq	0x3c4e68                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEaSERKS5_
0000000000167f55	movups	0x20(%rbx), %xmm0
0000000000167f59	movups	%xmm0, 0xd8(%r14)
0000000000167f61	popq	%rbx
0000000000167f62	popq	%r14
0000000000167f64	popq	%rbp
0000000000167f65	retq
0000000000167f66	nopw	%cs:(%rax,%rax)
