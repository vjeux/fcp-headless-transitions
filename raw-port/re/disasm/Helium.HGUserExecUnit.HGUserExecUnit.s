__ZN14HGUserExecUnitC1EP13HGRenderQueue:
0000000000095d80	pushq	%rbp
0000000000095d81	movq	%rsp, %rbp
0000000000095d84	leaq	0x975add(%rip), %rax
0000000000095d8b	movq	%rax, (%rdi)
0000000000095d8e	movq	%rsi, 0x10(%rdi)
0000000000095d92	movq	__ZN14HGUserExecUnit6_countE(%rip), %rax ## HGUserExecUnit::_count
0000000000095d99	incq	%rax
0000000000095d9c	movq	%rax, __ZN14HGUserExecUnit6_countE(%rip) ## HGUserExecUnit::_count
0000000000095da3	movl	%eax, 0x18(%rdi)
0000000000095da6	movq	$0x0, 0x20(%rdi)
0000000000095dae	xorl	%eax, %eax
0000000000095db0	xchgl	%eax, 0x8(%rdi)
0000000000095db3	popq	%rbp
0000000000095db4	retq
0000000000095db5	nopw	%cs:(%rax,%rax)
