__ZN13LiImageFilter13filteredEdgesEv:
000000000007e6d8	pushq	%rbp
000000000007e6d9	movq	%rsp, %rbp
000000000007e6dc	pushq	%rbx
000000000007e6dd	pushq	%rax
000000000007e6de	movq	%rdi, %rbx
000000000007e6e1	movq	0x10(%rdi), %rdi
000000000007e6e5	testq	%rdi, %rdi
000000000007e6e8	jne	0x7e6f8
000000000007e6ea	movl	$0x1, %edi
000000000007e6ef	callq	0x1c417a                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000007e6f4	movq	0x10(%rbx), %rdi
000000000007e6f8	movq	(%rdi), %rax
000000000007e6fb	addq	$0x8, %rsp
000000000007e6ff	popq	%rbx
000000000007e700	popq	%rbp
000000000007e701	jmpq	*0x20(%rax)
