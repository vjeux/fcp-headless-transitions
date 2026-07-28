__ZN10OZDocument15setIsEditLockedEb:
000000000004ae30	pushq	%rbp
000000000004ae31	movq	%rsp, %rbp
000000000004ae34	movl	0x78(%rdi), %eax
000000000004ae37	andl	$-0x9, %eax
000000000004ae3a	leal	(%rax,%rsi,8), %eax
000000000004ae3d	movl	%eax, 0x78(%rdi)
000000000004ae40	popq	%rbp
000000000004ae41	retq
000000000004ae42	nopw	%cs:(%rax,%rax)
