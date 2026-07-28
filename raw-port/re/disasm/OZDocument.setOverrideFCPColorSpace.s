__ZN10OZDocument24setOverrideFCPColorSpaceEb:
000000000004ae00	pushq	%rbp
000000000004ae01	movq	%rsp, %rbp
000000000004ae04	movl	0x78(%rdi), %eax
000000000004ae07	andl	$-0x5, %eax
000000000004ae0a	leal	(%rax,%rsi,4), %eax
000000000004ae0d	movl	%eax, 0x78(%rdi)
000000000004ae10	popq	%rbp
000000000004ae11	retq
000000000004ae12	nopw	%cs:(%rax,%rax)
