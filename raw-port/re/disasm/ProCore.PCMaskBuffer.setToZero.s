__ZN12PCMaskBuffer9setToZeroEv:
00000000000c4490	pushq	%rbp
00000000000c4491	movq	%rsp, %rbp
00000000000c4494	movq	(%rdi), %rax
00000000000c4497	movslq	0xc(%rdi), %rcx
00000000000c449b	movslq	0x10(%rdi), %rsi
00000000000c449f	imulq	%rcx, %rsi
00000000000c44a3	movq	%rax, %rdi
00000000000c44a6	popq	%rbp
00000000000c44a7	jmp	0xde6d8                         ## symbol stub for: ___bzero
