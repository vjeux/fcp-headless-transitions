__ZN10MonoPanner6CreateEv:
000000000124d1b0	pushq	%rbp
000000000124d1b1	movq	%rsp, %rbp
000000000124d1b4	movl	$0x20, %edi
000000000124d1b9	callq	0x1497452                       ## symbol stub for: __Znwm
000000000124d1be	movq	$0x0, 0x8(%rax)
000000000124d1c6	movw	$0x0, 0x10(%rax)
000000000124d1cc	movq	$0x64666c74, 0x14(%rax)         ## imm = 0x64666C74
000000000124d1d4	movl	$0x3663686e, 0x1c(%rax)         ## imm = 0x3663686E
000000000124d1db	leaq	0x6d3e86(%rip), %rcx
000000000124d1e2	movq	%rcx, (%rax)
000000000124d1e5	popq	%rbp
000000000124d1e6	retq
000000000124d1e7	nopw	(%rax,%rax)
