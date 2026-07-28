__ZN23PC_Sp_counted_base_implC1EP13PCShared_base:
000000000004dff2	pushq	%rbp
000000000004dff3	movq	%rsp, %rbp
000000000004dff6	movabsq	$0x100000000, %rax              ## imm = 0x100000000
000000000004e000	movq	%rax, 0x8(%rdi)
000000000004e004	leaq	0xfd04d(%rip), %rax
000000000004e00b	movq	%rax, (%rdi)
000000000004e00e	movq	%rsi, 0x10(%rdi)
000000000004e012	popq	%rbp
000000000004e013	retq
