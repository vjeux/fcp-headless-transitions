__ZN12PCMaskBuffer10setValueAtEiii:
00000000000c44ac	cmpl	$0x100, %esi                    ## imm = 0x100
00000000000c44b2	setae	%al
00000000000c44b5	testl	%edx, %edx
00000000000c44b7	sets	%r8b
00000000000c44bb	orb	%al, %r8b
00000000000c44be	jne	0xc44e3
00000000000c44c0	testl	%ecx, %ecx
00000000000c44c2	js	0xc44e3
00000000000c44c4	cmpl	0x8(%rdi), %edx
00000000000c44c7	jge	0xc44e3
00000000000c44c9	cmpl	0xc(%rdi), %ecx
00000000000c44cc	jge	0xc44e3
00000000000c44ce	pushq	%rbp
00000000000c44cf	movq	%rsp, %rbp
00000000000c44d2	imull	0x10(%rdi), %ecx
00000000000c44d6	movq	(%rdi), %rax
00000000000c44d9	addl	%edx, %ecx
00000000000c44db	movslq	%ecx, %rcx
00000000000c44de	movb	%sil, (%rax,%rcx)
00000000000c44e2	popq	%rbp
00000000000c44e3	retq
