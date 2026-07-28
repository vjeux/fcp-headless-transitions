__ZN16HgcSubtractAlphaD0Ev:
000000000146e9c0	pushq	%rbp
000000000146e9c1	movq	%rsp, %rbp
000000000146e9c4	pushq	%rbx
000000000146e9c5	pushq	%rax
000000000146e9c6	movq	%rdi, %rbx
000000000146e9c9	leaq	0x4c0160(%rip), %rax
000000000146e9d0	movq	%rax, (%rdi)
000000000146e9d3	movq	0x198(%rdi), %rax
000000000146e9da	testq	%rax, %rax
000000000146e9dd	je	0x146e9ed
000000000146e9df	movq	-0x8(%rax), %rdi
000000000146e9e3	testq	%rdi, %rdi
000000000146e9e6	je	0x146e9ed
000000000146e9e8	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146e9ed	movq	%rbx, %rdi
000000000146e9f0	callq	0x1496c0c                       ## symbol stub for: __ZN6HGNodeD2Ev
000000000146e9f5	movq	%rbx, %rdi
000000000146e9f8	addq	$0x8, %rsp
000000000146e9fc	popq	%rbx
000000000146e9fd	popq	%rbp
000000000146e9fe	jmp	0x1496d8c                       ## symbol stub for: __ZN8HGObjectdlEPv
000000000146ea03	nopw	%cs:(%rax,%rax)
