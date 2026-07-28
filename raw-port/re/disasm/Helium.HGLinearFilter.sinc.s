__ZN14HGLinearFilter4sincEfff:
000000000010f070	movaps	%xmm0, %xmm2
000000000010f073	mulss	0x2c330d(%rip), %xmm2
000000000010f07b	movaps	%xmm2, %xmm1
000000000010f07e	mulss	%xmm2, %xmm1
000000000010f082	movss	0x2b8c36(%rip), %xmm0
000000000010f08a	addss	%xmm0, %xmm1
000000000010f08e	ucomiss	%xmm0, %xmm1
000000000010f091	jne	0x10f096
000000000010f093	jp	0x10f096
000000000010f095	retq
000000000010f096	pushq	%rbp
000000000010f097	movq	%rsp, %rbp
000000000010f09a	subq	$0x10, %rsp
000000000010f09e	movaps	%xmm2, %xmm0
000000000010f0a1	movss	%xmm2, -0x4(%rbp)
000000000010f0a6	callq	0x3c55e2                        ## symbol stub for: _sinf
000000000010f0ab	divss	-0x4(%rbp), %xmm0
000000000010f0b0	addq	$0x10, %rsp
000000000010f0b4	popq	%rbp
000000000010f0b5	retq
000000000010f0b6	nopw	%cs:(%rax,%rax)
