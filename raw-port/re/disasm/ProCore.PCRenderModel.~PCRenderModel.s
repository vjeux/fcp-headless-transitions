__ZN13PCRenderModelD1Ev:
0000000000051bb4	pushq	%rbp
0000000000051bb5	movq	%rsp, %rbp
0000000000051bb8	pushq	%rbx
0000000000051bb9	pushq	%rax
0000000000051bba	movq	%rdi, %rbx
0000000000051bbd	addq	$0x10, %rdi
0000000000051bc1	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
0000000000051bc6	addq	$0x8, %rbx
0000000000051bca	movq	%rbx, %rdi
0000000000051bcd	addq	$0x8, %rsp
0000000000051bd1	popq	%rbx
0000000000051bd2	popq	%rbp
0000000000051bd3	jmp	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
