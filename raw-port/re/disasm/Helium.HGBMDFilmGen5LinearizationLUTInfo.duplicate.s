__ZNK33HGBMDFilmGen5LinearizationLUTInfo9duplicateEv:
0000000000115ad0	pushq	%rbp
0000000000115ad1	movq	%rsp, %rbp
0000000000115ad4	pushq	%rbx
0000000000115ad5	pushq	%rax
0000000000115ad6	movq	%rdi, %rbx
0000000000115ad9	movl	$0x28, %edi
0000000000115ade	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115ae3	movups	0x8(%rbx), %xmm0
0000000000115ae7	movups	0x14(%rbx), %xmm1
0000000000115aeb	movups	%xmm0, 0x8(%rax)
0000000000115aef	movups	%xmm1, 0x14(%rax)
0000000000115af3	leaq	0x9073ce(%rip), %rcx
0000000000115afa	movq	%rcx, (%rax)
0000000000115afd	addq	$0x8, %rsp
0000000000115b01	popq	%rbx
0000000000115b02	popq	%rbp
0000000000115b03	retq
0000000000115b04	nopw	%cs:(%rax,%rax)
