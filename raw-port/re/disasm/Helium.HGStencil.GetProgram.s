__ZN9HGStencil10GetProgramEP10HGRenderer:
00000000002d2710	pushq	%rbp
00000000002d2711	movq	%rsp, %rbp
00000000002d2714	movslq	0x1b4(%rdi), %rax
00000000002d271b	leaq	__ZL19s_gpu_stencil_table(%rip), %rcx ## s_gpu_stencil_table
00000000002d2722	movq	%rsi, %rdi
00000000002d2725	popq	%rbp
00000000002d2726	jmpq	*(%rcx,%rax,8)
00000000002d2729	nopl	(%rax)
