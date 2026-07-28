__ZN13OZOpticalFlow26GetMotionVectorFileForClipEPK9OZFootage:
00000000004ed060	pushq	%rbp
00000000004ed061	movq	%rsp, %rbp
00000000004ed064	pushq	%r14
00000000004ed066	pushq	%rbx
00000000004ed067	movq	%rsi, %rbx
00000000004ed06a	movq	%rdi, %r14
00000000004ed06d	callq	__ZN19OZPreferenceManager8InstanceEv ## OZPreferenceManager::Instance()
00000000004ed072	movq	%rax, %rdi
00000000004ed075	callq	__ZN19OZPreferenceManager23getOpticalFlowCacheModeEv ## OZPreferenceManager::getOpticalFlowCacheMode()
00000000004ed07a	movq	%r14, %rdi
00000000004ed07d	movq	%rbx, %rsi
00000000004ed080	movl	%eax, %edx
00000000004ed082	callq	__ZN13OZOpticalFlow26GetMotionVectorFileForClipEPK9OZFootagei ## OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*, int)
00000000004ed087	movq	%r14, %rax
00000000004ed08a	popq	%rbx
00000000004ed08b	popq	%r14
00000000004ed08d	popq	%rbp
00000000004ed08e	retq
00000000004ed08f	nop
