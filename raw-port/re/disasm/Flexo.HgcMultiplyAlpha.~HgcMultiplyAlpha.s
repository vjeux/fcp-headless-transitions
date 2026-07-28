__ZN16HgcMultiplyAlphaD0Ev:
0000000001469370	pushq	%rbp
0000000001469371	movq	%rsp, %rbp
0000000001469374	pushq	%rbx
0000000001469375	pushq	%rax
0000000001469376	movq	%rdi, %rbx
0000000001469379	leaq	0x4c49a0(%rip), %rax
0000000001469380	movq	%rax, (%rdi)
0000000001469383	movq	0x198(%rdi), %rax
000000000146938a	testq	%rax, %rax
000000000146938d	je	0x146939d
000000000146938f	movq	-0x8(%rax), %rdi
0000000001469393	testq	%rdi, %rdi
0000000001469396	je	0x146939d
0000000001469398	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000146939d	movq	%rbx, %rdi
00000000014693a0	callq	0x1496c0c                       ## symbol stub for: __ZN6HGNodeD2Ev
00000000014693a5	movq	%rbx, %rdi
00000000014693a8	addq	$0x8, %rsp
00000000014693ac	popq	%rbx
00000000014693ad	popq	%rbp
00000000014693ae	jmp	0x1496d8c                       ## symbol stub for: __ZN8HGObjectdlEPv
00000000014693b3	nopw	%cs:(%rax,%rax)
