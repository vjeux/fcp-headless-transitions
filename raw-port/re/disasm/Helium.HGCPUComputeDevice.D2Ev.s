__ZN18HGCPUComputeDeviceD2Ev:
0000000000117280	pushq	%rbp
0000000000117281	movq	%rsp, %rbp
0000000000117284	pushq	%rbx
0000000000117285	pushq	%rax
0000000000117286	movq	%rdi, %rbx
0000000000117289	testb	$0x1, 0x48(%rdi)
000000000011728d	je	0x117298
000000000011728f	movq	0x58(%rbx), %rdi
0000000000117293	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117298	leaq	__ZTV15HGComputeDevice(%rip), %rax ## vtable for HGComputeDevice
000000000011729f	addq	$0x10, %rax
00000000001172a3	movq	%rax, (%rbx)
00000000001172a6	testb	$0x1, 0x28(%rbx)
00000000001172aa	je	0x1172b5
00000000001172ac	movq	0x38(%rbx), %rdi
00000000001172b0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001172b5	testb	$0x1, 0x10(%rbx)
00000000001172b9	jne	0x1172c2
00000000001172bb	addq	$0x8, %rsp
00000000001172bf	popq	%rbx
00000000001172c0	popq	%rbp
00000000001172c1	retq
00000000001172c2	movq	0x20(%rbx), %rdi
00000000001172c6	addq	$0x8, %rsp
00000000001172ca	popq	%rbx
00000000001172cb	popq	%rbp
00000000001172cc	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001172d1	nopw	%cs:(%rax,%rax)
