__ZNK12PCMaskBuffer10getValueAtEii:
00000000000c491e	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000c4923	testl	%esi, %esi
00000000000c4925	js	0xc494a
00000000000c4927	testl	%edx, %edx
00000000000c4929	js	0xc494a
00000000000c492b	cmpl	0x8(%rdi), %esi
00000000000c492e	jge	0xc494a
00000000000c4930	cmpl	0xc(%rdi), %edx
00000000000c4933	jge	0xc494a
00000000000c4935	pushq	%rbp
00000000000c4936	movq	%rsp, %rbp
00000000000c4939	imull	0x10(%rdi), %edx
00000000000c493d	movq	(%rdi), %rax
00000000000c4940	addl	%esi, %edx
00000000000c4942	movslq	%edx, %rcx
00000000000c4945	movzbl	(%rax,%rcx), %eax
00000000000c4949	popq	%rbp
00000000000c494a	retq
00000000000c494b	nop
