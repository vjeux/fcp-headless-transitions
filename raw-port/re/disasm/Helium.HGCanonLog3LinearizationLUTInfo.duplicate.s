__ZNK31HGCanonLog3LinearizationLUTInfo9duplicateEv:
0000000000115890	pushq	%rbp
0000000000115891	movq	%rsp, %rbp
0000000000115894	pushq	%rbx
0000000000115895	pushq	%rax
0000000000115896	movq	%rdi, %rbx
0000000000115899	movl	$0x28, %edi
000000000011589e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001158a3	movups	0x8(%rbx), %xmm0
00000000001158a7	movups	0x14(%rbx), %xmm1
00000000001158ab	movups	%xmm0, 0x8(%rax)
00000000001158af	movups	%xmm1, 0x14(%rax)
00000000001158b3	leaq	0x90742e(%rip), %rcx
00000000001158ba	movq	%rcx, (%rax)
00000000001158bd	addq	$0x8, %rsp
00000000001158c1	popq	%rbx
00000000001158c2	popq	%rbp
00000000001158c3	retq
00000000001158c4	nopw	%cs:(%rax,%rax)
