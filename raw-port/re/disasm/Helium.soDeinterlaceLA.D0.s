__ZN15soDeinterlaceLAD0Ev:
000000000003e940	pushq	%rbp
000000000003e941	movq	%rsp, %rbp
000000000003e944	pushq	%rbx
000000000003e945	pushq	%rax
000000000003e946	movq	%rdi, %rbx
000000000003e949	callq	__ZN17Hgc2DeinterlaceLAD2Ev     ## Hgc2DeinterlaceLA::~Hgc2DeinterlaceLA()
000000000003e94e	movq	%rbx, %rdi
000000000003e951	addq	$0x8, %rsp
000000000003e955	popq	%rbx
000000000003e956	popq	%rbp
000000000003e957	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003e95c	nopl	(%rax)
__ZN18HGGPURenderContextC2EP13HGGPURenderer:
000000000003e960	pushq	%rbp
